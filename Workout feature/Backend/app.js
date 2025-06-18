import express from "express";
import cors from "cors"; // 👈 import cors
import dotenv from "dotenv";
import workoutRouter from "./Routes/workout.route.js";

dotenv.config();

const app = express();

// ✅ Enable CORS for all origins
app.use(cors()); 

// If you want to restrict:
/// app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());
app.use("/api/workouts", workoutRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
