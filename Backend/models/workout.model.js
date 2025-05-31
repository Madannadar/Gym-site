import { pool } from "../db/db.js";

// Exercise Functions
const recordExercise = async ({
  name,
  description,
  muscle_group,
  units,
  created_by,
}) => {
  const query = `
    INSERT INTO exercises (name, description, muscle_group, units, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  // Make sure units is an array if provided, else send null
  const values = [
    name,
    description,
    muscle_group,
    units && Array.isArray(units) ? units : null,
    created_by,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const fetchAllExercises = async () => {
  const query = `
    SELECT e.*, u.name AS created_by_name
    FROM exercises e
    LEFT JOIN users u ON e.created_by = u.user_id
    ORDER BY e.created_at DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};


const fetchExerciseById = async (id) => {
  const query = `
    SELECT e.*, u.name as created_by_name
    FROM exercises e
    LEFT JOIN users u ON e.created_by = u.user_id
    WHERE e.exercise_id = $1;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};


const updateExerciseById = async (
  id,
  { name, description, muscle_group, units },
) => {
  const query = `
    UPDATE exercises
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        muscle_group = COALESCE($3, muscle_group),
        units = COALESCE($4, units)
    WHERE exercise_id = $5
    RETURNING *;
  `;
  const values = [name, description, muscle_group, units, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteExerciseById = async (id) => {
  const query = `
    DELETE FROM exercises
    WHERE exercise_id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Workout Functions
const recordWorkout = async ({
  name,
  created_by,
  description,
  structure,
  score,
}) => {
  const query = `
    INSERT INTO workouts (name, created_by, description, structure, score)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [
    name,
    created_by,
    description,
    JSON.stringify(structure),
    score,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const fetchAllWorkouts = async () => {
  const query = `
    SELECT w.*, u.name as created_by_name
    FROM workouts w
    LEFT JOIN users u ON w.created_by = u.user_id
    ORDER BY w.created_at DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};


const fetchWorkoutById = async (id) => {
  const workoutQuery = `
    SELECT w.*, u.name as created_by_name
    FROM workouts w
    LEFT JOIN users u ON w.created_by = u.user_id
    WHERE w.workout_id = $1;
  `;
  const workoutResult = await pool.query(workoutQuery, [id]);
  if (workoutResult.rows.length === 0) return null;

  const workout = workoutResult.rows[0];
  const exerciseIds = workout.structure
    .map((item) => item.exercise_id)
    .filter((id) => id);

  if (exerciseIds.length > 0) {
    const exercisesQuery = `
      SELECT exercise_id, name, description, muscle_group, units
      FROM exercises
      WHERE exercise_id = ANY($1);
    `;
    const exercisesResult = await pool.query(exercisesQuery, [exerciseIds]);
    const exercisesMap = exercisesResult.rows.reduce((acc, exercise) => {
      acc[exercise.exercise_id] = exercise;
      return acc;
    }, {});

    workout.structure = workout.structure.map((item) => ({
      ...item,
      exercise_details: exercisesMap[item.exercise_id] || null,
    }));
  }

  return workout;
};

const updateWorkoutById = async (
  id,
  { name, description, structure, score },
) => {
  const query = `
    UPDATE workouts
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        structure = COALESCE($3, structure),
        score = COALESCE($4, score)
    WHERE workout_id = $5
    RETURNING *;
  `;
  const values = [
    name,
    description,
    structure ? JSON.stringify(structure) : null,
    score,
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteWorkoutById = async (id) => {
  const query = `
    DELETE FROM workouts
    WHERE workout_id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Workout Log Functions
const recordWorkoutLog = async ({
  user_id,
  regiment_id,
  regiment_day_index,
  log_date,
  planned_workout_id,
  actual_workout,
  score,
}) => {
  const query = `
    INSERT INTO workout_logs (user_id, regiment_id, regiment_day_index, log_date, planned_workout_id, actual_workout, score)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    user_id,
    regiment_id,
    regiment_day_index,
    log_date,
    planned_workout_id,
    JSON.stringify(actual_workout),
    score || 0,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const fetchUserWorkoutLogs = async (user_id, limit = 50, offset = 0) => {
  const query = `
    SELECT wl.*,
           u.username,
           w.name as planned_workout_name,
           r.name as regiment_name
    FROM workout_logs wl
    LEFT JOIN users u ON wl.user_id = u.user_id
    LEFT JOIN workouts w ON wl.planned_workout_id = w.workout_id
    LEFT JOIN regiments r ON wl.regiment_id = r.regiment_id
    WHERE wl.user_id = $1
    ORDER BY wl.log_date DESC, wl.created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const { rows } = await pool.query(query, [user_id, limit, offset]);
  return rows;
};

const fetchWorkoutLogById = async (id) => {
  const query = `
    SELECT wl.*,
           u.username,
           w.name as planned_workout_name,
           w.structure as planned_workout_structure,
           r.name as regiment_name
    FROM workout_logs wl
    LEFT JOIN users u ON wl.user_id = u.user_id
    LEFT JOIN workouts w ON wl.planned_workout_id = w.workout_id
    LEFT JOIN regiments r ON wl.regiment_id = r.regiment_id
    WHERE wl.workout_log_id = $1;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const updateWorkoutLogById = async (id, { actual_workout, score }) => {
  const query = `
    UPDATE workout_logs
    SET actual_workout = COALESCE($1, actual_workout),
        score = COALESCE($2, score)
    WHERE workout_log_id = $3
    RETURNING *;
  `;
  const values = [
    actual_workout ? JSON.stringify(actual_workout) : null,
    score,
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteWorkoutLogById = async (id) => {
  const query = `
    DELETE FROM workout_logs
    WHERE workout_log_id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Regiment Functions
const recordRegiment = async ({
  created_by,
  name,
  description,
  workout_structure,
}) => {
  const query = `
    INSERT INTO regiments (created_by, name, description, workout_structure)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [
    created_by,
    name,
    description,
    JSON.stringify(workout_structure),
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const fetchAllRegiments = async () => {
  const query = `
    SELECT r.*, u.username as created_by_name
    FROM regiments r
    LEFT JOIN users u ON r.created_by = u.user_id
    ORDER BY r.created_at DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const fetchRegimentById = async (id) => {
  const regimentQuery = `
    SELECT r.*, u.username as created_by_name
    FROM regiments r
    LEFT JOIN users u ON r.created_by = u.user_id
    WHERE r.regiment_id = $1;
  `;
  const regimentResult = await pool.query(regimentQuery, [id]);
  if (regimentResult.rows.length === 0) return null;

  const regiment = regimentResult.rows[0];
  const workoutIds = regiment.workout_structure
    .map((day) => day.workout_id)
    .filter((id) => id);

  if (workoutIds.length > 0) {
    const workoutsQuery = `
      SELECT workout_id, name, description, structure, score
      FROM workouts
      WHERE workout_id = ANY($1);
    `;
    const workoutsResult = await pool.query(workoutsQuery, [workoutIds]);
    const workoutsMap = workoutsResult.rows.reduce((acc, workout) => {
      acc[workout.workout_id] = workout;
      return acc;
    }, {});

    regiment.workout_structure = regiment.workout_structure.map((day) => ({
      ...day,
      workout_details: workoutsMap[day.workout_id] || null,
    }));
  }

  return regiment;
};

const updateRegimentById = async (
  id,
  { name, description, workout_structure },
) => {
  const query = `
    UPDATE regiments
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        workout_structure = COALESCE($3, workout_structure)
    WHERE regiment_id = $4
    RETURNING *;
  `;
  const values = [
    name,
    description,
    workout_structure ? JSON.stringify(workout_structure) : null,
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteRegimentById = async (id) => {
  const query = `
    DELETE FROM regiments
    WHERE regiment_id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export {
  recordExercise,
  fetchAllExercises,
  fetchExerciseById,
  updateExerciseById,
  deleteExerciseById,
  recordWorkout,
  fetchAllWorkouts,
  fetchWorkoutById,
  updateWorkoutById,
  deleteWorkoutById,
  recordWorkoutLog,
  fetchUserWorkoutLogs,
  fetchWorkoutLogById,
  updateWorkoutLogById,
  deleteWorkoutLogById,
  recordRegiment,
  fetchAllRegiments,
  fetchRegimentById,
  updateRegimentById,
  deleteRegimentById,
};
