import express from "express";
import dotenv from "dotenv";
import { createDietPlanController } from "./controller/dietPlanController.js";
import { createDietPlanTable } from "./models/DietPlan.js";

dotenv.config();

const app = express();
app.use(express.json());

// Create table if it doesn't exist
createDietPlanTable().then(() => console.log("DietPlan table ready!"));

// Routes
app.use("/api", createDietPlanController);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
