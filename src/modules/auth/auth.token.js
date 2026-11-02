import jwt from "jsonwebtoken";
import env from "../../config/env.js";

const ALGORITHM = "HS256";

export function signToken(member) {
    return jwt.sign({ name: member.member_name }, env.JWT_SECRET, {
        algorithm: ALGORITHM,
        subject: String(member.member_id),
        expiresIn: env.JWT_EXPIRES_IN,
    });
}

// Throws if the token is invalid or expired
export function verifyToken(token) {
    // Pin the algorithm so a token can't pick its own (e.g. "none")
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
    return { member_id: Number(payload.sub), member_name: payload.name };
}
