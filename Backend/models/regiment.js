import { pool } from "../Db/db.js";

// Create a new regiment
const createRegiment = async (name) => {
  const query = `
    INSERT INTO regiments (name)
    VALUES ($1)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [name]);
  return rows[0];
};

// Add a workout to a regiment
const addWorkoutToRegiment = async (regimentId, workoutName) => {
  const query = `
    INSERT INTO workouts (regiment_id, name)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [regimentId, workoutName]);
  return rows[0];
};

// Add an exercise to a workout
const addExerciseToWorkout = async (workoutId, exerciseName) => {
  const query = `
    INSERT INTO exercises (workout_id, name)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [workoutId, exerciseName]);
  return rows[0];
};

// Add a set to an exercise
const addSetToExercise = async ({ exerciseId, setName, unitType, value }) => {
  const query = `
    INSERT INTO sets (exercise_id, set_name, unit_type, value)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [exerciseId, setName, unitType, value]);
  return rows[0];
};

// Get all regiments with their structure
const getAllRegiments = async () => {
  const query = `
    SELECT 
      r.id AS regiment_id, r.name AS regiment_name,
      w.id AS workout_id, w.name AS workout_name,
      e.id AS exercise_id, e.name AS exercise_name,
      s.id AS set_id, s.set_name, s.unit_type, s.value
    FROM regiments r
    LEFT JOIN workouts w ON r.id = w.regiment_id
    LEFT JOIN exercises e ON w.id = e.workout_id
    LEFT JOIN sets s ON e.id = s.exercise_id;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export {
  createRegiment,
  addWorkoutToRegiment,
  addExerciseToWorkout,
  addSetToExercise,
  getAllRegiments,
};
