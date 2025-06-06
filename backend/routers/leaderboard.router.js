import express from "express";
  import {
    getLeaderboard,
    getUserLeaderboard,
    createLeaderboardEntry,
    updateLeaderboardEntry,
    incrementScore,
    deleteLeaderboardEntry,
    resetAllScores,
    updateAllScores,
    assignCommunityLeaderboardController,
    getActiveDaysPerWeekController,
    promoteUsersController,
    createEventLeaderboardEntryController,
  } from "../controllers/leaderboard.controller.js";

  const router = express.Router();

  router.get("/", getLeaderboard); // ?limit=10&offset=0&type=community&daysPerWeek=3 or &type=event&eventId=1
  router.get("/:userId", getUserLeaderboard); // ?type=personal
  router.post("/", createLeaderboardEntry);
  router.put("/", updateLeaderboardEntry);
  router.patch("/increment/:userId", incrementScore);
  router.delete("/:userId", deleteLeaderboardEntry);
  router.post("/reset", resetAllScores);
  router.post("/update-scores", updateAllScores); // New endpoint
  router.post("/assign-community", assignCommunityLeaderboardController);
  router.get("/active-days", getActiveDaysPerWeekController);
  router.post("/promote", promoteUsersController);
  router.post("/event-entry", createEventLeaderboardEntryController);

  export default router;
