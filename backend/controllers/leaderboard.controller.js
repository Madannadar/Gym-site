import {
  fetchPaginatedLeaderboards,
  fetchLeaderboardByUserId,
  insertLeaderboard,
  updateLeaderboard,
  incrementLeaderboardScore,
  deleteLeaderboardByUserId,
  resetAllLeaderboardScores,
} from "../model/leaderboard.model.js";

export async function getLeaderboard(req, res) {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const entries = await fetchPaginatedLeaderboards({ limit, offset });
  res.json({ data: entries, limit, offset });
}

export async function getUserLeaderboard(req, res) {
  const { userId } = req.params;
  const entry = await fetchLeaderboardByUserId(userId);
  if (!entry)
    return res.status(404).json({ error: "User not found in leaderboard" });
  res.json(entry);
}

export async function createLeaderboardEntry(req, res) {
  const { user_id, regiment_id, total_score } = req.body;
  const entry = await insertLeaderboard({ user_id, regiment_id, total_score });
  res.status(201).json(entry);
}

export async function updateLeaderboardEntry(req, res) {
  const { user_id, regiment_id, total_score } = req.body;
  const updated = await updateLeaderboard({
    user_id,
    regiment_id,
    total_score,
  });
  res.json(updated);
}

export async function incrementScore(req, res) {
  const { userId } = req.params;
  const { delta } = req.body;
  const updated = await incrementLeaderboardScore(userId, delta);
  res.json(updated);
}

export async function deleteLeaderboardEntry(req, res) {
  const { userId } = req.params;
  const deleted = await deleteLeaderboardByUserId(userId);
  if (!deleted)
    return res.status(404).json({ error: "User not found in leaderboard" });
  res.json({ message: "Leaderboard entry deleted", deleted });
}

export async function resetAllScores(req, res) {
  await resetAllLeaderboardScores();
  res.json({ message: "All leaderboard scores reset to 0" });
}
