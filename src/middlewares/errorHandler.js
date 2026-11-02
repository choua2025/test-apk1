import HttpError from "../utils/HttpError.js";

export function notFound(req, res, next) {
    next(HttpError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars -- Express needs 4 args to treat this as an error handler
export function errorHandler(err, req, res, next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }

    // Errors from express.json(): malformed JSON, body too large
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Malformed JSON body" });
    }
    if (err.type === "entity.too.large") {
        return res.status(413).json({ message: "Request body too large" });
    }

    // Unknown error: log everything, tell the client nothing
    console.error(`[${req.method} ${req.originalUrl}]`, err);
    res.status(500).json({ message: "Internal server error" });
}
