import pool from "../config/db.js";

const recordDietLog = async (logData) => {
  const {
    user_id,
    template_id,
    log_date,
    breakfast,
    lunch,
    dinner,
    snacks,
    total_calories,
    proteins,
    fats,
    carbs,
    adherence,
  } = logData;

  const result = await pool.query(
    `INSERT INTO diet_logs (
      user_id, template_id, log_date, breakfast, lunch, dinner, snacks,
      total_calories, proteins, fats, carbs, adherence
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      user_id,
      template_id,
      log_date,
      breakfast,
      lunch,
      dinner,
      snacks,
      total_calories,
      proteins,
      fats,
      carbs,
      adherence,
    ],
  );
  return result.rows[0];
};

const fetchAllDietLogs = async () => {
  const result = await pool.query(
    "SELECT * FROM diet_logs ORDER BY created_at DESC",
  );
  return result.rows;
};

const fetchDietLogById = async (log_id) => {
  const result = await pool.query("SELECT * FROM diet_logs WHERE log_id = $1", [
    log_id,
  ]);
  return result.rows[0];
};

const fetchUserDietLogs = async (user_id, log_date = null) => {
  let result;
  if (log_date) {
    result = await pool.query(
      "SELECT * FROM diet_logs WHERE user_id = $1 AND log_date = $2 ORDER BY created_at DESC",
      [user_id, log_date],
    );
  } else {
    result = await pool.query(
      "SELECT * FROM diet_logs WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id],
    );
  }
  return result.rows;
};

const updateDietLogById = async (log_id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const result = await pool.query(
    `UPDATE diet_logs SET ${setClause} WHERE log_id = $${fields.length + 1} RETURNING *`,
    [...values, log_id],
  );
  return result.rows[0];
};

const deleteDietLogById = async (log_id) => {
  const result = await pool.query(
    "DELETE FROM diet_logs WHERE log_id = $1 RETURNING *",
    [log_id],
  );
  return result.rows[0];
};

export {
  recordDietLog,
  fetchAllDietLogs,
  fetchDietLogById,
  fetchUserDietLogs,
  updateDietLogById,
  deleteDietLogById,
};
