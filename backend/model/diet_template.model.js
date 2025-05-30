import db from "../config/db.js";

const insertDietTemplateModel = async (templateData) => {
  const {
    created_by,
    name,
    description,
    breakfast,
    lunch,
    dinner,
    snacks,
    difficulty,
  } = templateData;

  const query = `
    INSERT INTO diet_templates (
      created_by, name, description,
      breakfast, lunch, dinner, snacks,
      difficulty
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    created_by || null,
    name,
    description || null,
    breakfast || null,
    lunch || null,
    dinner || null,
    snacks || null,
    difficulty || null,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const getAllDietTemplatesModel = async () => {
  const result = await db.query(
    `SELECT * FROM diet_templates ORDER BY created_at DESC;`,
  );
  return result.rows;
};

const getDietTemplateByIdModel = async (template_id) => {
  const result = await db.query(
    `SELECT * FROM diet_templates WHERE template_id = $1;`,
    [template_id],
  );
  return result.rows[0];
};

const updateDietTemplateModel = async (template_id, updateData) => {
  const { name, description, breakfast, lunch, dinner, snacks, difficulty } =
    updateData;

  const query = `
    UPDATE diet_templates SET
      name = $1,
      description = $2,
      breakfast = $3,
      lunch = $4,
      dinner = $5,
      snacks = $6,
      difficulty = $7
    WHERE template_id = $8
    RETURNING *;
  `;

  const values = [
    name,
    description,
    breakfast,
    lunch,
    dinner,
    snacks,
    difficulty,
    template_id,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteDietTemplateModel = async (template_id) => {
  const result = await db.query(
    `DELETE FROM diet_templates WHERE template_id = $1 RETURNING *;`,
    [template_id],
  );
  return result.rows[0];
};

const getDietTemplatesByUserIdModel = async (user_id) => {
  const result = await db.query(
    `SELECT * FROM diet_templates WHERE created_by = $1 ORDER BY created_at DESC;`,
    [user_id],
  );
  return result.rows;
};

const deleteAllDietTemplatesByUserIdModel = async (user_id) => {
  const result = await db.query(
    `DELETE FROM diet_templates WHERE created_by = $1 RETURNING *;`,
    [user_id],
  );
  return result.rows;
};

export {
  getDietTemplateByIdModel,
  updateDietTemplateModel,
  deleteDietTemplateModel,
  insertDietTemplateModel,
  getAllDietTemplatesModel,
  getDietTemplatesByUserIdModel,
  deleteAllDietTemplatesByUserIdModel,
};
