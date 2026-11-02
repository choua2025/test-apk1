import express from "express";
import memberRouter from "../controllers/member.js";
import customerRouter from "../controllers/customer_table.js";
const router = express.Router();

// member auth: /member/register, /member/login
router.use("/member", memberRouter);

// customer CRUD (table: customer), requires login token
router.use("/customer", customerRouter);

export default router;
