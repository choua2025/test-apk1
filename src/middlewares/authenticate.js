import { verifyToken } from "../modules/auth/auth.token.js";
import HttpError from "../utils/HttpError.js";

export default function authenticate(req, res, next) {
    const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
        throw HttpError.unauthorized("Please log in first");
    }

    try {
        req.member = verifyToken(token);
    } catch {
        throw HttpError.unauthorized("Invalid or expired token");
    }

    next();
}
