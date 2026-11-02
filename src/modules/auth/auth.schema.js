import { z } from "zod";

const username = z
    .string({ error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[\w.-]+$/, "Username may only contain letters, numbers, _ . -");

const password = z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    // bcrypt silently ignores everything after 72 bytes
    .refine((v) => Buffer.byteLength(v) <= 72, "Password is too long");

export const registerSchema = z.object({
    member_name: username,
    member_password: password,
});

// Login only checks presence: don't leak the password policy to attackers
export const loginSchema = z.object({
    member_name: z.string({ error: "Username is required" }).trim().min(1, "Username is required"),
    member_password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});
