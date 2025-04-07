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
const addSetToExercise = async ({ exerciseId, set_name, reps, weight, weight_label, time, time_label }) => {
  const query = `
    INSERT INTO sets (exercise_id, set_name, reps, weight, weight_label, time, time_label)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [
    exerciseId,
    set_name,
    reps,
    weight,
    weight_label,
    time,
    time_label
  ]);
  return rows[0];
};



const logActualSetPerformance = async ({
  setId,
  userId,
  actualReps,
  actualWeight,
  actualWeightLabel,
  actualTime,
  actualTimeLabel,
}) => {
  const query = `
    INSERT INTO set_logs (
      set_id,
      user_id,
      actual_reps,
      actual_weight,
      actual_weight_label,
      actual_time,
      actual_time_label
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    setId,
    userId,
    actualReps,
    actualWeight,
    actualWeightLabel,
    actualTime,
    actualTimeLabel,
  ]);

  return rows[0];
};



// Get all regiments with their structure
const getAllRegiments = async () => {
  const query = `
    SELECT 
      r.id AS regiment_id, r.name AS regiment_name,
      w.id AS workout_id, w.name AS workout_name,
      e.id AS exercise_id, e.name AS exercise_name,
      s.id AS set_id, s.set_name, s.reps, s.weight, s.weight_label,
      s.time, s.time_label,
      sl.id AS log_id, sl.user_id, sl.actual_reps, sl.actual_weight, sl.actual_weight_label,
      sl.actual_time, sl.actual_time_label, sl.created_at
    FROM regiments r
    LEFT JOIN workouts w ON r.id = w.regiment_id
    LEFT JOIN exercises e ON w.id = e.workout_id
    LEFT JOIN sets s ON e.id = s.exercise_id
    LEFT JOIN set_logs sl ON s.id = sl.set_id
    ORDER BY r.id, w.id, e.id, s.id, sl.created_at DESC;
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
  logActualSetPerformance
};
