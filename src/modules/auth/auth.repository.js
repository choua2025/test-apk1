import db from "../../config/db.js";

export async function hasAnyMember() {
    const [rows] = await db.execute("SELECT 1 FROM member LIMIT 1");
    return rows.length > 0;
}

export async function findMemberByName(memberName) {
    const [rows] = await db.execute(
        "SELECT member_id, member_name, member_password FROM member WHERE member_name = ?",
        [memberName]
    );
    return rows[0] ?? null;
}

export async function createMember(memberName, passwordHash) {
    const [result] = await db.execute(
        "INSERT INTO member (member_name, member_password) VALUES (?, ?)",
        [memberName, passwordHash]
    );
    return { member_id: result.insertId, member_name: memberName };
}
