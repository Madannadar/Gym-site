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

  try {
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
    console.log("recordDietLog result:", result.rows[0]); // Debug log
    return result.rows[0];
  } catch (err) {
    console.error("recordDietLog error:", err.stack); // Debug log
    throw err;
  }
};

const fetchAllDietLogs = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM diet_logs ORDER BY created_at DESC",
    );
    console.log("fetchAllDietLogs result:", result.rows.length); // Debug log
    return result.rows;
  } catch (err) {
    console.error("fetchAllDietLogs error:", err.stack); // Debug log
    throw err;
  }
};

const fetchDietLogById = async (log_id) => {
  try {
    const result = await pool.query("SELECT * FROM diet_logs WHERE log_id = $1", [
      log_id,
    ]);
    console.log("fetchDietLogById result:", result.rows[0]); // Debug log
    return result.rows[0];
  } catch (err) {
    console.error("fetchDietLogById error:", err.stack); // Debug log
    throw err;
  }
};

const fetchUserDietLogs = async (user_id, log_date = null) => {
  try {
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
    console.log("fetchUserDietLogs result:", result.rows.length); // Debug log
    return result.rows;
  } catch (err) {
    console.error("fetchUserDietLogs error:", err.stack); // Debug log
    throw err;
  }
};

const updateDietLogById = async (log_id, updates) => {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE diet_logs SET ${setClause} WHERE log_id = $${fields.length + 1} RETURNING *`,
      [...values, log_id],
    );
    console.log("updateDietLogById result:", result.rows[0]); // Debug log
    return result.rows[0];
  } catch (err) {
    console.error("updateDietLogById error:", err.stack); // Debug log
    throw err;
  }
};

const deleteDietLogById = async (log_id) => {
  try {
    const result = await pool.query(
      "DELETE FROM diet_logs WHERE log_id = $1 RETURNING *",
      [log_id],
    );
    console.log("deleteDietLogById result:", result.rows[0]); // Debug log
    return result.rows[0];
  } catch (err) {
    console.error("deleteDietLogById error:", err.stack); // Debug log
    throw err;
  }
};

export {
  recordDietLog,
  fetchAllDietLogs,
  fetchDietLogById,
  fetchUserDietLogs,
  updateDietLogById,
  deleteDietLogById,
};
