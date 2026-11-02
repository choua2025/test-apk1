// Errors that are safe to show to the client. Anything else becomes a 500.
export default class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.details = details;
    }

    static badRequest(message, details) {
        return new HttpError(400, message, details);
    }

    static unauthorized(message = "Unauthorized") {
        return new HttpError(401, message);
    }

    static notFound(message = "Not found") {
        return new HttpError(404, message);
    }

    static conflict(message) {
        return new HttpError(409, message);
    }
}
