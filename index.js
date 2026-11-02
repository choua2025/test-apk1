import express from "express";
import dotenv from "dotenv";
import pool from "./src/configs/db.js";
import router from "./src/routes/index.js";
import cors from "cors";
dotenv.config();
const app = express();


app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("Error acquiring connection", err.stack);
  });
app.use("/api", router);
app.listen(5000, () => {
  console.log("Server started on port http://localhost:5000");
});