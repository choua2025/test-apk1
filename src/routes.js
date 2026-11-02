import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import customerRoutes from "./modules/customer/customer.routes.js";

const router = express.Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));

// /member/register, /member/login, /member/exists, /member/me
router.use("/member", authRoutes);

// customer CRUD, requires login token
router.use("/customer", customerRoutes);

export default router;
