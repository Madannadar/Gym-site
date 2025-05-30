import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loggerMiddleware } from "./middlewares/logger.js";
import db from "./config/db.js";
import attendanceRouter from "./routers/attendance.router.js";
import dietLogRouter from "./routers/diet_log.router.js";
import dietTemplateRouter from "./routers/diet_template.router.js";
import dishRouter from "./routers/dish.router.js";
import eventRouter from "./routers/event.router.js";
import healthMetricRouter from "./routers/health_matric.router.js";
import userRouter from "./routers/user.router.js";
import workoutRouter from "./routers/workout.router.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Root Route
app.get("/", (req, res) => {
  res.send("Gym Site API is running 🚀");
});

// API Routes
app.use("/api/diet-logs", dietLogRouter);
app.use("/api/dishes", dishRouter);
app.use("/api/diet-templates", dietTemplateRouter);
app.use("/api/users", userRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/events", eventRouter);
app.use("/api/health-metrics", healthMetricRouter);
app.use("/api/workouts", workoutRouter);
app.use("/api/qrcode", qrRouter);

// 404 Error Handling
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
