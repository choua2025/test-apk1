import express from "express";
import rateLimit from "express-rate-limit";
import env from "../../config/env.js";
import authenticate from "../../middlewares/authenticate.js";
import validate from "../../middlewares/validate.js";
import * as controller from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const router = express.Router();

// Slow down password guessing: 10 attempts per 15 min per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    message: { message: "Too many attempts, please try again later" },
});

router.get("/exists", controller.exists);
router.post("/register", authLimiter, validate({ body: registerSchema }), controller.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), controller.login);
router.get("/me", authenticate, controller.me);

export default router;
