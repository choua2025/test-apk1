import cors from "cors";
import express from "express";
import helmet from "helmet";
import env from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import routes from "./routes.js";

const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin) {
    if (!origin) return true; // curl, server-to-server
    if (env.corsOrigins.length) return env.corsOrigins.includes(origin);
    return !env.isProduction && LOCALHOST.test(origin);
}

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    })
);
app.use(express.json({ limit: "10kb" }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
