import db from "../config/db.js";

export const insertDietTemplateModel = async (templateData) => {
  const {
    created_by,
    name,
    description,
    breakfast,
    lunch,
    dinner,
    snacks,
    number_of_meals,
    difficulty,
    calories,
    protein,
    carbs,
    fats,
  } = templateData;

  const safeJson = (val) => (val ? JSON.stringify(val) : null);

  const query = `
    INSERT INTO diet_templates (
      created_by, name, description, breakfast, lunch, dinner, snacks,
      number_of_meals, difficulty, calories, protein, carbs, fats
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;

  const values = [
    created_by || null, // Allow NULL for admin templates
    name,
    description,
    safeJson(breakfast),
    safeJson(lunch),
    safeJson(dinner),
    safeJson(snacks),
    number_of_meals || null,
    difficulty || null,
    calories || 0,
    protein || 0,
    carbs || 0,
    fats || 0,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

export const getAllDietTemplatesModel = async () => {
  const result = await db.query(
    "SELECT * FROM diet_templates ORDER BY created_at DESC"
  );
  return result.rows;
};

export const getDietTemplateByIdModel = async (id) => {
  const result = await db.query(
    "SELECT * FROM diet_templates WHERE template_id = $1",
    [id]
  );
  return result.rows[0];
};

export const updateDietTemplateModel = async (id, templateData) => {
  const {
    name,
    description,
    breakfast,
    lunch,
    dinner,
    snacks,
    number_of_meals,
    difficulty,
    calories,
    protein,
    carbs,
    fats,
  } = templateData;

  const safeJson = (val) => (val ? JSON.stringify(val) : null);

  const query = `
    UPDATE diet_templates
    SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      breakfast = COALESCE($3, breakfast),
      lunch = COALESCE($4, lunch),
      dinner = COALESCE($5, dinner),
      snacks = COALESCE($6, snacks),
      number_of_meals = COALESCE($7, number_of_meals),
      difficulty = COALESCE($8, difficulty),
      calories = COALESCE($9, calories),
      protein = COALESCE($10, protein),
      carbs = COALESCE($11, carbs),
      fats = COALESCE($12, fats),
      updated_at = CURRENT_TIMESTAMP
    WHERE template_id = $13
    RETURNING *;
  `;

  const values = [
    name,
    description,
    safeJson(breakfast),
    safeJson(lunch),
    safeJson(dinner),
    safeJson(snacks),
    number_of_meals,
    difficulty,
    calories,
    protein,
    carbs,
    fats,
    id,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
};

export const deleteDietTemplateByIdModel = async (id) => {
  const result = await db.query(
    "DELETE FROM diet_templates WHERE template_id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const getDietTemplatesByUserIdModel = async (userId) => {
  const result = await db.query(
    "SELECT * FROM diet_templates WHERE created_by = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
};

export const deleteAllDietTemplatesByUserIdModel = async (userId) => {
  const result = await db.query(
    "DELETE FROM diet_templates WHERE created_by = $1 RETURNING *",
    [userId]
  );
  return result.rows;
};
