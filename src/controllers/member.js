import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../configs/db.js";

const router = express.Router();

// CHECK IF ANY MEMBER EXISTS (frontend uses this to pick register vs login)
router.get("/exists", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT 1 FROM member LIMIT 1");
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { member_name, member_password } = req.body ?? {};

        if (
            typeof member_name !== "string" ||
            !member_name.trim() ||
            typeof member_password !== "string" ||
            member_password.length < 8
        ) {
            return res.status(400).json({
                message: "Username is required and password must be at least 8 characters"
            });
        }

        const hashedPassword = await bcrypt.hash(member_password, 12);

        const [result] = await db.execute(
            `INSERT INTO member (member_name, member_password)
             VALUES (?, ?)`,
            [member_name.trim(), hashedPassword]
        );

        res.status(201).json({
            message: "Member registered successfully",
            member_id: result.insertId,
            member_name: member_name.trim(),
            member_password: hashedPassword
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { member_name, member_password } = req.body ?? {};

        if (
            typeof member_name !== "string" ||
            typeof member_password !== "string"
        ) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const [rows] = await db.execute(
            `SELECT member_id, member_name, member_password
             FROM member WHERE member_name = ?`,
            [member_name.trim()]
        );

        if (
            rows.length === 0 ||
            !(await bcrypt.compare(member_password, rows[0].member_password))
        ) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const member = rows[0];
        const JWT_SECRET =  'chouavang12345678';
        const token = jwt.sign(
            {
                member_id: member.member_id,
                member_name: member.member_name
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            member: {
                member_id: member.member_id,
                member_name: member.member_name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
