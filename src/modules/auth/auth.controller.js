import * as authService from "./auth.service.js";

// Express 5 forwards rejected promises to the error handler, so no try/catch here.

export async function exists(req, res) {
    res.json({ exists: await authService.hasAnyMember() });
}

export async function register(req, res) {
    const member = await authService.register(req.validated.body);
    res.status(201).json({ message: "Member registered successfully", member });
}

export async function login(req, res) {
    const { token, member } = await authService.login(req.validated.body);
    res.json({ message: "Login successful", token, member });
}

export function me(req, res) {
    res.json({ member: req.member });
}
