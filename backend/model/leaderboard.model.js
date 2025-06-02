import db from "../config/db.js";

export async function fetchPaginatedLeaderboards({ limit = 10, offset = 0 }) {
  const res = await db.query(
    `SELECT * FROM leaderboard
     ORDER BY total_score DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return res.rows;
}

export async function fetchLeaderboardByUserId(userId) {
  const res = await db.query(`SELECT * FROM leaderboard WHERE user_id = $1`, [
    userId,
  ]);
  return res.rows[0];
}

export async function insertLeaderboard({
  user_id,
  regiment_id,
  total_score = 0,
}) {
  const res = await db.query(
    `INSERT INTO leaderboard (user_id, regiment_id, total_score)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, regiment_id, total_score],
  );
  return res.rows[0];
}

export async function updateLeaderboard({ user_id, regiment_id, total_score }) {
  const res = await db.query(
    `UPDATE leaderboard
     SET regiment_id = $2,
         total_score = $3,
         last_updated = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING *`,
    [user_id, regiment_id, total_score],
  );
  return res.rows[0];
}

export async function incrementLeaderboardScore(userId, delta) {
  const res = await db.query(
    `UPDATE leaderboard
     SET total_score = total_score + $2,
         last_updated = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING *`,
    [userId, delta],
  );
  return res.rows[0];
}

export async function deleteLeaderboardByUserId(userId) {
  const res = await db.query(
    `DELETE FROM leaderboard
     WHERE user_id = $1
     RETURNING *`,
    [userId],
  );
  return res.rows[0];
}

export async function resetAllLeaderboardScores() {
  await db.query(
    `UPDATE leaderboard
     SET total_score = 0,
         last_updated = CURRENT_TIMESTAMP`,
  );
}
