import db from "../../config/db.js";

const COLUMNS = "customer_id, customer_name";

export async function findAll() {
    const [rows] = await db.execute(`SELECT ${COLUMNS} FROM customer ORDER BY customer_id DESC`);
    return rows;
}

export async function findById(id) {
    const [rows] = await db.execute(`SELECT ${COLUMNS} FROM customer WHERE customer_id = ?`, [id]);
    return rows[0] ?? null;
}

export async function create(customerName) {
    const [result] = await db.execute("INSERT INTO customer (customer_name) VALUES (?)", [
        customerName,
    ]);
    return { customer_id: result.insertId, customer_name: customerName };
}

// Returns false if no row matched
export async function update(id, customerName) {
    const [result] = await db.execute(
        "UPDATE customer SET customer_name = ? WHERE customer_id = ?",
        [customerName, id]
    );
    return result.affectedRows > 0;
}

export async function remove(id) {
    const [result] = await db.execute("DELETE FROM customer WHERE customer_id = ?", [id]);
    return result.affectedRows > 0;
}
