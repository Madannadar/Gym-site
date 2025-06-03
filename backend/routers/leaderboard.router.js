import express from "express";
import {
  getLeaderboard,
  getUserLeaderboard,
  createLeaderboardEntry,
  updateLeaderboardEntry,
  incrementScore,
  deleteLeaderboardEntry,
  resetAllScores,
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/", getLeaderboard); // supports ?limit=10&offset=0
router.get("/:userId", getUserLeaderboard);
router.post("/", createLeaderboardEntry);
router.put("/", updateLeaderboardEntry);
router.patch("/increment/:userId", incrementScore);
router.delete("/:userId", deleteLeaderboardEntry);
router.post("/reset", resetAllScores);

export default router;
