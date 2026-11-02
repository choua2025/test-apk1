import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
    const authorization = req.headers.authorization;
    const JWT_SECRET = 'chouavang12345678';
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    try {
        const token = authorization.split(" ")[1];

        req.member = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}
