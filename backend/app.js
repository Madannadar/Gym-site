import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routers/index.js";
import { loggerMiddleware } from "./middlewares/logger.js"; // Import middleware
import db from "./config/db.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware); // Use the logger middleware

// Routes
app.use("/api", router);

export default app;
