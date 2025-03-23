import db from "../config/db.js";

export const getAllExercises = async () => {
  const result = await db.query("SELECT * FROM exercises");
  return result.rows;
};

export const getExerciseById = async (id) => {
  const result = await db.query("SELECT * FROM exercises WHERE id = $1", [id]);
  return result.rows[0];
};

export const createExercise = async (name, description, caloriesBurned) => {
  const result = await db.query(
    "INSERT INTO exercises (name, description, calories_burned) VALUES ($1, $2, $3) RETURNING *",
    [name, description, caloriesBurned],
  );
  return result.rows[0];
};

export const updateExercise = async (id, name, description, caloriesBurned) => {
  const result = await db.query(
    "UPDATE exercises SET name = $1, description = $2, calories_burned = $3 WHERE id = $4 RETURNING *",
    [name, description, caloriesBurned, id],
  );
  return result.rows[0];
};

export const deleteExercise = async (id) => {
  const result = await db.query(
    "DELETE FROM exercises WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0];
};
