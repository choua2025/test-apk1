import assert from "node:assert/strict";
import { afterEach, describe, mock, test } from "node:test";
import bcrypt from "bcrypt";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";
import { signToken } from "../src/modules/auth/auth.token.js";

const auth = { Authorization: `Bearer ${signToken({ member_id: 1, member_name: "alice" })}` };

// Replace the DB with a fake: handler(sql, params) returns what pool.execute resolves to
function mockDb(handler) {
    return mock.method(pool, "execute", async (sql, params) => handler(sql, params));
}

afterEach(() => mock.restoreAll());

describe("general", () => {
    test("GET /api/health", async () => {
        const res = await request(app).get("/api/health").expect(200);
        assert.deepEqual(res.body, { status: "ok" });
    });

    test("unknown route returns JSON 404", async () => {
        const res = await request(app).get("/api/nope").expect(404);
        assert.match(res.body.message, /not found/);
    });

    test("malformed JSON returns 400", async () => {
        await request(app)
            .post("/api/member/login")
            .set("Content-Type", "application/json")
            .send("{bad json")
            .expect(400, { message: "Malformed JSON body" });
    });

    test("unexpected errors return a generic 500", async () => {
        mockDb(() => {
            throw new Error("connection lost");
        });
        mock.method(console, "error", () => {});
        const res = await request(app).get("/api/customer").set(auth).expect(500);
        assert.deepEqual(res.body, { message: "Internal server error" });
    });
});

describe("auth", () => {
    test("register rejects short password", async () => {
        const res = await request(app)
            .post("/api/member/register")
            .send({ member_name: "bob", member_password: "short" })
            .expect(400);
        assert.equal(res.body.message, "Password must be at least 8 characters");
    });

    test("register does not return the password hash", async () => {
        mockDb(() => [{ insertId: 7 }]);
        const res = await request(app)
            .post("/api/member/register")
            .send({ member_name: " bob ", member_password: "password123" })
            .expect(201);
        assert.deepEqual(res.body.member, { member_id: 7, member_name: "bob" });
        assert.ok(!JSON.stringify(res.body).includes("$2b$"));
    });

    test("register duplicate username returns 409", async () => {
        mockDb(() => {
            throw Object.assign(new Error("dup"), { code: "ER_DUP_ENTRY" });
        });
        await request(app)
            .post("/api/member/register")
            .send({ member_name: "bob", member_password: "password123" })
            .expect(409, { message: "Username already exists" });
    });

    test("login succeeds and returns a working token", async () => {
        const hash = await bcrypt.hash("password123", 4);
        mockDb(() => [[{ member_id: 3, member_name: "bob", member_password: hash }]]);

        const res = await request(app)
            .post("/api/member/login")
            .send({ member_name: "bob", member_password: "password123" })
            .expect(200);
        assert.deepEqual(res.body.member, { member_id: 3, member_name: "bob" });

        const me = await request(app)
            .get("/api/member/me")
            .set("Authorization", `Bearer ${res.body.token}`)
            .expect(200);
        assert.deepEqual(me.body.member, { member_id: 3, member_name: "bob" });
    });

    test("login with unknown user and wrong password give the same error", async () => {
        const hash = await bcrypt.hash("password123", 4);
        const body = { member_name: "bob", member_password: "wrong-password" };

        mockDb(() => [[]]);
        const unknown = await request(app).post("/api/member/login").send(body).expect(401);
        mock.restoreAll();

        mockDb(() => [[{ member_id: 3, member_name: "bob", member_password: hash }]]);
        const wrong = await request(app).post("/api/member/login").send(body).expect(401);

        assert.deepEqual(unknown.body, wrong.body);
    });

    test("exists reports whether any member exists", async () => {
        mockDb(() => [[]]);
        await request(app).get("/api/member/exists").expect(200, { exists: false });
    });
});

describe("customer", () => {
    test("requires a token", async () => {
        await request(app).get("/api/customer").expect(401, { message: "Please log in first" });
    });

    test("rejects an invalid token", async () => {
        await request(app)
            .get("/api/customer")
            .set("Authorization", "Bearer not-a-token")
            .expect(401, { message: "Invalid or expired token" });
    });

    test("list", async () => {
        const rows = [{ customer_id: 1, customer_name: "Acme" }];
        mockDb(() => [rows]);
        await request(app).get("/api/customer").set(auth).expect(200, { data: rows });
    });

    test("get rejects a non-numeric id", async () => {
        await request(app)
            .get("/api/customer/abc")
            .set(auth)
            .expect(400)
            .expect((res) => assert.equal(res.body.message, "Invalid customer ID"));
    });

    test("get returns 404 when missing", async () => {
        mockDb(() => [[]]);
        await request(app)
            .get("/api/customer/99")
            .set(auth)
            .expect(404, { message: "Customer not found" });
    });

    test("create trims the name", async () => {
        const db = mockDb(() => [{ insertId: 5 }]);
        const res = await request(app)
            .post("/api/customer")
            .set(auth)
            .send({ customer_name: "  Acme  " })
            .expect(201);
        assert.deepEqual(res.body, { data: { customer_id: 5, customer_name: "Acme" } });
        assert.equal(res.headers.location, "/api/customer/5");
        assert.deepEqual(db.mock.calls[0].arguments[1], ["Acme"]);
    });

    test("create rejects an empty name", async () => {
        await request(app)
            .post("/api/customer")
            .set(auth)
            .send({ customer_name: "   " })
            .expect(400)
            .expect((res) => assert.equal(res.body.message, "Customer name is required"));
    });

    test("update returns 404 when missing", async () => {
        mockDb(() => [{ affectedRows: 0 }]);
        await request(app)
            .put("/api/customer/99")
            .set(auth)
            .send({ customer_name: "New" })
            .expect(404);
    });

    test("delete returns 204", async () => {
        mockDb(() => [{ affectedRows: 1 }]);
        await request(app).delete("/api/customer/1").set(auth).expect(204);
    });
});
