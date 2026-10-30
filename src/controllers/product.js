import pool from "../configs/db.js";

export const getDataProducts = async (req,res) => {
 try {
    const result = await pool.query("select * from products");
    res.json(result.rows);
 } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
 }
}