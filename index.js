import app from "./src/app.js";
import env from "./src/config/env.js";
import pool, { pingDatabase } from "./src/config/db.js";

// Fail fast: don't accept traffic if the database is unreachable
try {
    await pingDatabase();
    console.log("Database connected successfully");
} catch (err) {
    console.error("Cannot connect to database:", err.message);
    process.exit(1);
}

const server = app.listen(env.PORT, () => {
    console.log(`Server started on http://localhost:${env.PORT}`);
});

// Finish in-flight requests, then close DB connections
function shutdown(signal) {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
    // Force exit if something hangs
    setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
