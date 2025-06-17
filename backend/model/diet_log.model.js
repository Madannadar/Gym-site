import db from "../config/db.js";

const parseJson = (val) => {
  try {
    return val ? JSON.parse(val) : [];
  } catch (err) {
    console.error("JSON parse error in model:", err.message);
    return [];
  }
};

export const insertDietLog = async (data) => {
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
  } = data;

  try {
    const query = `
      INSERT INTO diet_logs (
        user_id, template_id, log_date, breakfast, lunch, dinner, snacks,
        total_calories, proteins, fats, carbs, adherence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      parseInt(user_id),
      template_id ? parseInt(template_id) : null,
      log_date,
      breakfast ? JSON.stringify(breakfast) : null,
      lunch ? JSON.stringify(lunch) : null,
      dinner ? JSON.stringify(dinner) : null,
      snacks ? JSON.stringify(snacks) : null,
      Number(total_calories) || 0,
      Number(proteins) || 0,
      Number(fats) || 0,
      Number(carbs) || 0,
      adherence !== undefined ? adherence : null,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error inserting diet log:", err.stack);
    throw err;
  }
};

export const getAllDietLogs = async () => {
  try {
    const result = await db.query("SELECT * FROM diet_logs");
    return result.rows;
  } catch (err) {
    console.error("❌ Error fetching all diet logs:", err.stack);
    throw err;
  }
};

export const getDietLogById = async (id) => {
  try {
    const result = await db.query("SELECT * FROM diet_logs WHERE log_id = $1", [parseInt(id)]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error fetching diet log by ID:", err.stack);
    throw err;
  }
};

export const getDietLogsByUser = async (user_id, log_date) => {
  try {
    let query = "SELECT * FROM diet_logs WHERE user_id = $1";
    const values = [parseInt(user_id)];

    if (log_date) {
      query += " AND log_date = $2";
      values.push(log_date);
    }

    const result = await db.query(query, values);
    return result.rows;
  } catch (err) {
    console.error("❌ Error fetching user diet logs:", err.stack);
    throw err;
  }
};

export const updateDietLog = async (id, data) => {
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
  } = data;

  try {
    const query = `
      UPDATE diet_logs
      SET
        user_id = $1,
        template_id = $2,
        log_date = $3,
        breakfast = $4,
        lunch = $5,
        dinner = $6,
        snacks = $7,
        total_calories = $8,
        proteins = $9,
        fats = $10,
        carbs = $11,
        adherence = $12
      WHERE log_id = $13
      RETURNING *;
    `;
    const values = [
      parseInt(user_id),
      template_id ? parseInt(template_id) : null,
      log_date,
      breakfast ? JSON.stringify(breakfast) : null,
      lunch ? JSON.stringify(lunch) : null,
      dinner ? JSON.stringify(dinner) : null,
      snacks ? JSON.stringify(snacks) : null,
      Number(total_calories) || 0,
      Number(proteins) || 0,
      Number(fats) || 0,
      Number(carbs) || 0,
      adherence !== undefined ? adherence : null,
      parseInt(id),
    ];

    const result = await db.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error updating diet log:", err.stack);
    throw err;
  }
};

export const deleteDietLog = async (id) => {
  try {
    const result = await db.query(
      "DELETE FROM diet_logs WHERE log_id = $1 RETURNING *",
      [parseInt(id)]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error deleting diet log:", err.stack);
    throw err;
  }
};
