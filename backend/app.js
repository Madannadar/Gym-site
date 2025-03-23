import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routers/index.js";
import { loggerMiddleware } from "./middlewares/logger.js";
import db from "./config/db.js";
import exerciseRouter from "./routers/exercise.router.js";
import workoutTempletRouter from "./routers/workoutTemplet.router.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Routes
app.use("/api", router);
app.use("/exercise", exerciseRouter);
app.use("/workouttemplet", workoutTempletRouter);

export default app;
