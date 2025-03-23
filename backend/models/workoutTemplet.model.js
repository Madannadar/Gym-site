import db from "../config/db.js";

export const getAllWorkoutTemplates = async () => {
  const result = await db.query("SELECT * FROM workout_templates");
  return result.rows;
};

export const getWorkoutTemplateById = async (id) => {
  const result = await db.query(
    "SELECT * FROM workout_templates WHERE id = $1",
    [id],
  );
  return result.rows[0];
};

export const createWorkoutTemplate = async (
  name,
  description,
  coverImage,
  difficulty,
  duration,
) => {
  const result = await db.query(
    "INSERT INTO workout_templates (name, description, cover_image, difficulty, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, description, coverImage, difficulty, duration],
  );
  return result.rows[0];
};

export const updateWorkoutTemplate = async (
  id,
  name,
  description,
  coverImage,
  difficulty,
  duration,
) => {
  const result = await db.query(
    "UPDATE workout_templates SET name = $1, description = $2, cover_image = $3, difficulty = $4, duration = $5 WHERE id = $6 RETURNING *",
    [name, description, coverImage, difficulty, duration, id],
  );
  return result.rows[0];
};

export const deleteWorkoutTemplate = async (id) => {
  const result = await db.query(
    "DELETE FROM workout_templates WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0];
};
