import pool from "../config/db.js";

export const insertDietLog = async (logData) => {
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

  const safeJson = (val) => (val ? JSON.stringify(val) : null);

  const query = `
    INSERT INTO diet_logs (
      user_id, template_id, log_date,
      breakfast, lunch, dinner, snacks,
      total_calories, proteins, fats, carbs, adherence
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;

  const values = [
    user_id,
    template_id,
    log_date,
    safeJson(breakfast),
    safeJson(lunch),
    safeJson(dinner),
    safeJson(snacks),
    total_calories,
    proteins,
    fats,
    carbs,
    adherence,
  ];

  console.log("🧪 Executing Query:", query);
  console.log("📦 With Values:", values);

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all diet logs
export const getAllDietLogs = async () => {
  const result = await pool.query(
    "SELECT * FROM diet_logs ORDER BY created_at DESC",
  );
  return result.rows;
};

// Get a single diet log by ID
export const getDietLogById = async (log_id) => {
  const result = await pool.query("SELECT * FROM diet_logs WHERE log_id = $1", [
    log_id,
  ]);
  return result.rows[0];
};

// Get all diet logs for a user (optionally filtered by date)
export const getDietLogsByUser = async (user_id, log_date = null) => {
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

// Update a diet log by ID
export const updateDietLog = async (log_id, logData) => {
  const {
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

  const safeJson = (val) => (val ? JSON.stringify(val) : null);

  const query = `
    UPDATE diet_logs SET
      template_id = $1,
      log_date = $2,
      breakfast = $3,
      lunch = $4,
      dinner = $5,
      snacks = $6,
      total_calories = $7,
      proteins = $8,
      fats = $9,
      carbs = $10,
      adherence = $11
    WHERE log_id = $12
    RETURNING *;
  `;

  const values = [
    template_id,
    log_date,
    safeJson(breakfast),
    safeJson(lunch),
    safeJson(dinner),
    safeJson(snacks),
    total_calories,
    proteins,
    fats,
    carbs,
    safeJson(adherence),
    log_id,
  ];

  console.log("🧪 Executing Query:", query);
  console.log("📦 With Values:", values);

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete a diet log by ID
export const deleteDietLog = async (log_id) => {
  const result = await pool.query(
    "DELETE FROM diet_logs WHERE log_id = $1 RETURNING *",
    [log_id],
  );
  return result.rows[0];
};
