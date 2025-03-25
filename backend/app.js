import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routers/user.router.js";
import { loggerMiddleware } from "./middlewares/logger.js";
import db from "./config/db.js";
import exerciseRouter from "./routers/exercise.router.js";
import workoutTempletRouter from "./routers/workoutTemplet.router.js";
import eventRouter from "./routers/event.router.js";
import dietplanRouter from "./routers/dietPlanRoutes.js";
import foodRoutes from "./routers/foodRoutes.js";
import DietFood from "./routers/dietPlanfoodRoutes.js";
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Routes
app.use("/user", router);
app.use("/exercise", exerciseRouter);
app.use("/workouttemplet", workoutTempletRouter);
app.use("/event", eventRouter);
app.use("/dietplan", dietplanRouter);
app.use('/food',foodRoutes)
app.use('/foodTODiet',DietFood)


// better
// app.use("/api", router);
// app.use("/api", exerciseRouter);
// app.use("/api", workoutTempletRouter);
// app.use("/api", eventRouter);
// app.use("/api", dietplanRouter);
// app.use('/api',foodRoutes)

export default app;
