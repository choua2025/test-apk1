import HttpError from "../utils/HttpError.js";

/**
 * Validate req.params / req.query / req.body with zod schemas.
 * Parsed (trimmed, coerced) values are put on req.validated.
 */
export default function validate(schemas) {
    return (req, res, next) => {
        req.validated = {};

        for (const key of ["params", "query", "body"]) {
            if (!schemas[key]) continue;

            const result = schemas[key].safeParse(req[key] ?? {});
            if (!result.success) {
                const issues = result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
                throw HttpError.badRequest(issues[0].message, issues);
            }
            req.validated[key] = result.data;
        }

        next();
    };
}
