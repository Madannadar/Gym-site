import db from "../config/db.js";

export const insertDietLog = async (logData, client = db) => {
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

  const safeJson = (val) => {
    try {
      return val ? JSON.stringify(val) : null;
    } catch (err) {
      throw new Error(`Invalid JSON for ${val}: ${err.message}`);
    }
  };

  const query = `
    INSERT INTO diet_logs (
      user_id, template_id, log_date,
      breakfast, lunch, dinner, snacks,
      total_calories, proteins, fats, carbs, adherence
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;

  const values = [
    parseInt(user_id),
    template_id ? parseInt(template_id) : null,
    log_date,
    safeJson(breakfast),
    safeJson(lunch),
    safeJson(dinner),
    safeJson(snacks),
    total_calories || 0,
    proteins || 0,
    fats || 0,
    carbs || 0,
    safeJson(adherence),
  ];

  console.log("🧪 Executing Query:", query);
  console.log("📦 With Values:", values);

  const result = await client.query(query, values);
  return result.rows[0];
};

export const getAllDietLogs = async () => {
  const result = await db.query(
    "SELECT * FROM diet_logs ORDER BY created_at DESC"
  );
  return result.rows;
};

export const getDietLogById = async (log_id) => {
  const result = await db.query("SELECT * FROM diet_logs WHERE log_id = $1", [
    log_id,
  ]);
  return result.rows[0];
};

export const getDietLogsByUser = async (user_id, log_date = null) => {
  let result;
  if (log_date) {
    result = await db.query(
      "SELECT * FROM diet_logs WHERE user_id = $1 AND log_date = $2 ORDER BY created_at DESC",
      [parseInt(user_id), log_date]
    );
  } else {
    result = await db.query(
      "SELECT * FROM diet_logs WHERE user_id = $1 ORDER BY created_at DESC",
      [parseInt(user_id)]
    );
  }
  return result.rows;
};

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

  const safeJson = (val) => {
    try {
      return val ? JSON.stringify(val) : null;
    } catch (err) {
      throw new Error(`Invalid JSON for ${val}: ${err.message}`);
    }
  };

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
    template_id ? parseInt(template_id) : null,
    log_date,
    safeJson(breakfast),
    safeJson(lunch),
    safeJson(dinner),
    safeJson(snacks),
    total_calories || 0,
    proteins || 0,
    fats || 0,
    carbs || 0,
    safeJson(adherence),
    log_id,
  ];

  console.log("🧪 Executing Query:", query);
  console.log("📦 With Values:", values);

  const result = await db.query(query, values);
  return result.rows[0];
};

export const deleteDietLog = async (log_id) => {
  const result = await db.query(
    "DELETE FROM diet_logs WHERE log_id = $1 RETURNING *",
    [log_id]
  );
  return result.rows[0];
};
