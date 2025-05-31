import express from "express";
import dotenv from "dotenv";
// import dietplan from "./Routes/dietPlanRoutes.js";
// // import { createDietPlanTable } from "./models/DietPlan.js";
// import Food from "./Routes/foodRoutes.js";
// import DietFood from "./Routes/dietPlanfoodRoutes.js";
// import RegimentRoutes from "./Routes/regimentRoutes.js";
import workoutRouter from "./Routes/workout.route.js";

dotenv.config();

const app = express();
app.use(express.json());

// Create table if it doesn't exist
// createDietPlanTable().then(() => console.log("DietPlan table ready!"));

// Routes
// app.use("/api", dietplan);
// app.use('/api',Food);
// app.use('/api',DietFood);
// app.use('/api', RegimentRoutes);
app.use("/api/workouts", workoutRouter);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
