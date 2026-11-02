import express from "express";
import db from "../configs/db.js";
import authenticate from "../middlewares/auth.js";

const router = express.Router();

// Protect all customer endpoints
router.use(authenticate);

// READ ALL
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT customer_id, customer_name FROM customer ORDER BY customer_id DESC"
        );

        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// READ ONE
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }

        const [rows] = await db.execute(
            "SELECT customer_id, customer_name FROM customer WHERE customer_id = ?",
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({ data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// CREATE
router.post("/", async (req, res) => {
    try {
        const { customer_name } = req.body ?? {};

        if (
            typeof customer_name !== "string" ||
            !customer_name.trim()
        ) {
            return res.status(400).json({
                message: "Customer name is required"
            });
        }

        const [result] = await db.execute(
            "INSERT INTO customer (customer_name) VALUES (?)",
            [customer_name.trim()]
        );

        res.status(201).json({
            customer_id: result.insertId,
            customer_name: customer_name.trim()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// UPDATE
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { customer_name } = req.body ?? {};

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }

        if (
            typeof customer_name !== "string" ||
            !customer_name.trim()
        ) {
            return res.status(400).json({
                message: "Customer name is required"
            });
        }

        const [result] = await db.execute(
            "UPDATE customer SET customer_name = ? WHERE customer_id = ?",
            [customer_name.trim(), id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({ message: "Customer updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }

        const [result] = await db.execute(
            "DELETE FROM customer WHERE customer_id = ?",
            [id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
