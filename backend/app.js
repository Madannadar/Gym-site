import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import "./cron.js";
import passport from "./config/passport.js";
import { loggerMiddleware } from "./middlewares/logger.js";
import dishRouter from "./routers/dish.router.js";
import dietTempletRouter from "./routers/diet_template.router.js";
import dietLogRouter from "./routers/diet_log.router.js";
import workoutRouter from "./routers/workout.router.js";
import userRouter from "./routers/user.router.js";
import attendenceRouter from "./routers/attendence.router.js";
import healthMatricRouter from "./routers/health_matric.router.js";
import eventRouter from "./routers/event.router.js";
import rateLimit from "express-rate-limit";
import authRouter from "./routers/auth.router.js";
import authenticate from "./middlewares/authenticate.middleware.js";
import leaderboardRouter from "./routers/leaderboard.router.js";
import client, { register } from "prom-client"

dotenv.config();
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://gym-site-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use(loggerMiddleware);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

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
// Prometheus metrics endpoint
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics( {register: client.register} )

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType)
  const metrics = await client.register.metrics()
  res.send(metrics)
})

// API routes
app.use("/api/dishes", dishRouter);
app.use("/api/diet-templets", dietTempletRouter); // Updated to match endpoint
app.use("/api/diet-logs", dietLogRouter);
app.use("/api/workouts", workoutRouter);

app.use("/api/users", userRouter);
app.use("/api/attendence", attendenceRouter);
app.use("/api/health-metrics", healthMatricRouter);

app.use("/api/events", eventRouter);
app.use("/api/auth", authRouter);
app.use("/api/leaderboard", leaderboardRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
