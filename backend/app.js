import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { loggerMiddleware } from "./middlewares/logger.js";

// Routers
import dishRouter from "./routers/dish.router.js";

import dietTempletRouter from "./routers/diet_templet.router.js";
import dietLogRouter from "./routers/diet_log.router.js";
import workoutRouter from "./routers/workout.router.js";
import userRouter from "./routers/user.router.js";
import attendenceRouter from "./routers/attendence.router.js";
import healthMatricRouter from "./routers/health_matric.router.js";
import eventRouter from "./routers/event.router.js";
import leaderboardRouter from "./routers/leaderboard.router.js";
import authRouter from "./routers/auth.router.js";
import authenticate from "./middlewares/authenticate.middleware.js";
// const rateLimit = require("express-rate-limit");
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Base route
app.get("/", (req, res) => {
  res.send("Gym Site API is running 🚀");
});

// API routes
app.use("/api/dishes", dishRouter);
app.use("/api/diet-templets", dietTempletRouter);
app.use("/api/diet-logs", authenticate, dietLogRouter);
app.use("/api/workouts", workoutRouter);
app.use("/api/users", authenticate, userRouter);
app.use("/api/attendence", authenticate, attendenceRouter);
app.use("/api/health-metrics", authenticate, healthMatricRouter);
app.use("/api/events", eventRouter);
app.use("/api/auth", authRouter);
app.use("/api/leaderboard", leaderboardRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
