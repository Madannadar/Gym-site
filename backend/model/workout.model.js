import db from "../config/db.js";

// Exercise Functions
const recordExercise = async ({
  name,
  description,
  muscle_group,
  units,
  created_by,
  intensity,
}) => {
  // Check for duplicate exercise by name and created_by
  const duplicateCheckQuery = `
    SELECT 1 FROM exercises WHERE name = $1 AND created_by = $2 LIMIT 1;
  `;
  const duplicateCheck = await db.query(duplicateCheckQuery, [name, created_by]);
  if (duplicateCheck.rowCount > 0) {
    throw new Error("Exercise already present");
  }

  const query = `
    INSERT INTO exercises (name, description, muscle_group, units, created_by, intensity)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    name,
    description,
    muscle_group,
    units && Array.isArray(units) ? units : null,
    created_by,
    intensity,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const fetchAllExercises = async () => {
  const query = `
    SELECT e.*, u.name AS created_by_name
    FROM exercises e
    LEFT JOIN users u ON e.created_by = u.id
    ORDER BY e.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const fetchExerciseById = async (id) => {
  const query = `
    SELECT e.*, u.name as created_by_name
    FROM exercises e
    LEFT JOIN users u ON e.created_by = u.id
    WHERE e.exercise_id = $1;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updateExerciseById = async (
  id,
  { name, description, muscle_group, units, intensity }
) => {
  // Check for duplicate name if updated
  if (name) {
    const duplicateCheckQuery = `
      SELECT 1 FROM exercises WHERE name = $1 AND exercise_id != $2 LIMIT 1;
    `;
    const duplicateCheck = await db.query(duplicateCheckQuery, [name, id]);
    if (duplicateCheck.rowCount > 0) {
      throw new Error("Exercise name already present");
    }
  }

  const query = `
    UPDATE exercises
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        muscle_group = COALESCE($3, muscle_group),
        units = COALESCE($4, units),
        intensity = COALESCE($5, intensity)
    WHERE exercise_id = $6
    RETURNING *;
  `;
  const values = [name, description, muscle_group, units, intensity, id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteExerciseById = async (id) => {
  const query = `
    DELETE FROM exercises
    WHERE exercise_id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
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
  // Check for duplicate workout by name and created_by
  const duplicateCheckQuery = `
    SELECT 1 FROM workouts WHERE name = $1 AND created_by = $2 LIMIT 1;
  `;
  const duplicateCheck = await db.query(duplicateCheckQuery, [name, created_by]);
  if (duplicateCheck.rowCount > 0) {
    throw new Error("Workout already present");
  }

  const exerciseIds = structure.map(item => item.exercise_id);

  const checkQuery = `
    SELECT exercise_id, intensity
    FROM exercises
    WHERE exercise_id = ANY($1)
  `;
  const { rows: existingExercises } = await db.query(checkQuery, [exerciseIds]);

  const existingIds = existingExercises.map(e => e.exercise_id);
  const missingIds = exerciseIds.filter(id => !existingIds.includes(id));

  if (missingIds.length > 0) {
    throw new Error(
      `Invalid exercise_id(s) in structure: ${missingIds.join(', ')}`
    );
  }

  const intensityScale = {
    low: 2,
    medium: 3,
    high: 5,
  };

  const numericIntensities = existingExercises
    .map(e => intensityScale[e.intensity] || e.intensity)
    .filter(n => typeof n === 'number');

  const avgIntensity =
    numericIntensities.reduce((acc, val) => acc + val, 0) / numericIntensities.length || 1;

  const finalIntensity = Math.min(5, Math.max(1, parseFloat(avgIntensity.toFixed(2))));

  const insertQuery = `
    INSERT INTO workouts (name, created_by, description, structure, score, intensity)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    name,
    created_by,
    description,
    JSON.stringify(structure),
    score,
    finalIntensity,
  ];
  const { rows } = await db.query(insertQuery, values);
  return rows[0];
};

const fetchAllWorkouts = async () => {
  const query = `
    SELECT w.*, u.name AS created_by_name
    FROM workouts w
    LEFT JOIN users u ON w.created_by = u.id
    ORDER BY w.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const fetchWorkoutById = async (id) => {
  const workoutQuery = `
    SELECT w.*, u.name AS created_by_name
    FROM workouts w
    LEFT JOIN users u ON w.created_by = u.id
    WHERE w.workout_id = $1;
  `;
  const workoutResult = await db.query(workoutQuery, [id]);
  if (workoutResult.rows.length === 0) return null;

  const workout = workoutResult.rows[0];
  const structure = workout.structure;

  const exerciseIds = Array.isArray(structure)
    ? structure.map(item => item.exercise_id).filter(Boolean)
    : [];

  if (exerciseIds.length > 0) {
    const exercisesQuery = `
      SELECT exercise_id, name, description, muscle_group, units, intensity
      FROM exercises
      WHERE exercise_id = ANY($1);
    `;
    const exercisesResult = await db.query(exercisesQuery, [exerciseIds]);
    const exercisesMap = exercisesResult.rows.reduce((acc, exercise) => {
      acc[exercise.exercise_id] = exercise;
      return acc;
    }, {});

    workout.structure = structure.map(item => ({
      ...item,
      exercise_details: exercisesMap[item.exercise_id] || null,
    }));
  }

  return workout;
};

const updateWorkoutById = async (
  id,
  { name, description, structure, score }
) => {
  // Check for duplicate name if updated
  if (name) {
    const duplicateCheckQuery = `
      SELECT 1 FROM workouts WHERE name = $1 AND workout_id != $2 LIMIT 1;
    `;
    const duplicateCheck = await db.query(duplicateCheckQuery, [name, id]);
    if (duplicateCheck.rowCount > 0) {
      throw new Error("Workout name already present");
    }
  }

  let updatedIntensity = null;

  if (structure) {
    const exerciseIds = structure.map(item => item.exercise_id);
    const { rows: existingExercises } = await db.query(
      `SELECT intensity FROM exercises WHERE exercise_id = ANY($1)`,
      [exerciseIds]
    );

    const intensityScale = { low: 2, medium: 3, high: 5 };
    const numericIntensities = existingExercises
      .map(e => intensityScale[e.intensity] || e.intensity)
      .filter(n => typeof n === 'number');

    if (numericIntensities.length > 0) {
      const avg =
        numericIntensities.reduce((acc, val) => acc + val, 0) /
        numericIntensities.length;
      updatedIntensity = parseFloat(Math.min(5, Math.max(1, avg)).toFixed(2));
    }
  }

  const query = `
    UPDATE workouts
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        structure = COALESCE($3, structure),
        score = COALESCE($4, score),
        intensity = COALESCE($5, intensity)
    WHERE workout_id = $6
    RETURNING *;
  `;

  const values = [
    name,
    description,
    structure ? JSON.stringify(structure) : null,
    score,
    updatedIntensity,
    id,
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteWorkoutById = async (id) => {
  const query = `
    DELETE FROM workouts
    WHERE workout_id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const checkExists = async (table, idName, id) => {
  const query = `SELECT 1 FROM ${table} WHERE ${idName} = $1 LIMIT 1`;
  const { rowCount } = await db.query(query, [id]);
  return rowCount > 0;
};

const recordWorkoutLog = async ({
  user_id,
  regiment_id,
  regiment_day_index,
  log_date,
  planned_workout_id,
  actual_workout,
  score,
}) => {
  if (!(await checkExists('users', 'id', user_id))) {
    throw new Error(`User with id ${user_id} does not exist.`);
  }
  if (!(await checkExists('regiments', 'regiment_id', regiment_id))) {
    throw new Error(`Regiment with id ${regiment_id} does not exist.`);
  }
  if (!(await checkExists('workouts', 'workout_id', planned_workout_id))) {
    throw new Error(`Workout not found.`);
  }
  for (const exercise of actual_workout) {
    if (!(await checkExists('exercises', 'exercise_id', exercise.exercise_id))) {
      throw new Error(`Exercise with ID ${exercise.exercise_id} not found.`);
    }
  }

  const query = `
    INSERT INTO workout_logs (
      user_id,
      regiment_id,
      regiment_day_index,
      log_date,
      planned_workout_id,
      actual_workout,
      score
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
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

  const { rows } = await db.query(query, values);
  return rows[0];
};

const fetchUserWorkoutLogs = async (user_id, limit = 50, offset = 0) => {
  const query = `
    SELECT wl.*,
           u.name,
           w.name as planned_workout_name,
           r.name as regiment_name
    FROM workout_logs wl
    LEFT JOIN users u ON wl.user_id = u.id
    LEFT JOIN workouts w ON wl.planned_workout_id = w.workout_id
    LEFT JOIN regiments r ON wl.regiment_id = r.regiment_id
    WHERE wl.user_id = $1
    ORDER BY wl.log_date DESC, wl.created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const { rows } = await db.query(query, [user_id, limit, offset]);
  return rows;
};

const fetchWorkoutLogById = async (id) => {
  const query = `
    SELECT wl.*,
           u.name,
           w.name as planned_workout_name,
           w.structure as planned_workout_structure,
           r.name as regiment_name
    FROM workout_logs wl
    LEFT JOIN users u ON wl.user_id = u.id
    LEFT JOIN workouts w ON wl.planned_workout_id = w.workout_id
    LEFT JOIN regiments r ON wl.regiment_id = r.regiment_id
    WHERE wl.workout_log_id = $1;
  `;
  const { rows } = await db.query(query, [id]);
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
  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteWorkoutLogById = async (id) => {
  const query = `
    DELETE FROM workout_logs
    WHERE workout_log_id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

// Regiment Functions 
const recordRegiment = async ({
  created_by,
  name,
  description,
  workout_structure,
}) => {
  // Check for duplicate regiment by name and created_by
  const duplicateCheckQuery = `
    SELECT 1 FROM regiments WHERE name = $1 AND created_by = $2 LIMIT 1;
  `;
  const duplicateCheck = await db.query(duplicateCheckQuery, [name, created_by]);
  if (duplicateCheck.rowCount > 0) {
    throw new Error("Regiment already present");
  }

  if (!(await checkExists("users", "id", created_by))) {
    throw new Error(`User with id ${created_by} not found.`);
  }

  const workoutIds = workout_structure.map((day) => day.workout_id);

  const query = `
    SELECT workout_id, intensity
    FROM workouts
    WHERE workout_id = ANY($1);
  `;
  const { rows: workouts } = await db.query(query, [workoutIds]);

  const existingWorkoutIds = workouts.map((w) => w.workout_id);
  const missingWorkoutIds = workoutIds.filter(
    (id) => !existingWorkoutIds.includes(id)
  );

  if (missingWorkoutIds.length > 0) {
    throw new Error(`Workout ID(s) not found: ${missingWorkoutIds.join(", ")}`);
  }

  const intensities = workouts.map((w) => Number(w.intensity) || 0);
  const averageIntensity =
    intensities.reduce((acc, val) => acc + val, 0) / intensities.length;

  const insertQuery = `
    INSERT INTO regiments (
      created_by, name, description, workout_structure, intensity
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [
    created_by,
    name,
    description,
    JSON.stringify(workout_structure),
    averageIntensity,
  ];

  const { rows } = await db.query(insertQuery, values);
  return rows[0];
};

const fetchAllRegiments = async () => {
  const query = `
    SELECT 
      r.regiment_id,
      r.created_by,
      u.name AS created_by_name,
      r.name,
      r.description,
      r.workout_structure,
      r.intensity,
      r.created_at
    FROM regiments r
    LEFT JOIN users u ON r.created_by = u.id
    ORDER BY r.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const fetchRegimentById = async (id) => {
  const regimentQuery = `
    SELECT r.*, u.name AS created_by_name
    FROM regiments r
    LEFT JOIN users u ON r.created_by = u.id
    WHERE r.regiment_id = $1;
  `;
  const regimentResult = await db.query(regimentQuery, [id]);
  if (regimentResult.rows.length === 0) return null;

  const regiment = regimentResult.rows[0];
  const workoutIds = regiment.workout_structure
    .map((day) => day.workout_id)
    .filter((id) => id);

  if (workoutIds.length > 0) {
    const workoutsQuery = `
      SELECT workout_id, name, description, structure, score, intensity
      FROM workouts
      WHERE workout_id = ANY($1);
    `;
    const workoutsResult = await db.query(workoutsQuery, [workoutIds]);
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

const calculateAverageIntensity = async (workoutStructure) => {
  const workoutIds = workoutStructure.map((w) => w.workout_id);
  const query = `
    SELECT intensity
    FROM workouts
    WHERE workout_id = ANY($1);
  `;
  const { rows } = await db.query(query, [workoutIds]);
  const intensities = rows.map((row) => Number(row.intensity) || 0);

  return intensities.length > 0
    ? parseFloat(
        (intensities.reduce((acc, val) => acc + val, 0) / intensities.length).toFixed(2)
      )
    : 0;
};

const updateRegimentById = async (id, { name, description, workout_structure }) => {
  // Check for duplicate name if updated
  if (name) {
    const duplicateCheckQuery = `
      SELECT 1 FROM regiments WHERE name = $1 AND regiment_id != $2 LIMIT 1;
    `;
    const duplicateCheck = await db.query(duplicateCheckQuery, [name, id]);
    if (duplicateCheck.rowCount > 0) {
      throw new Error("Regiment name already present");
    }
  }

  const intensity = workout_structure
    ? await calculateAverageIntensity(workout_structure)
    : null;

  const query = `
    UPDATE regiments
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        workout_structure = COALESCE($3, workout_structure),
        intensity = COALESCE($4, intensity)
    WHERE regiment_id = $5
    RETURNING *;
  `;

  const values = [
    name,
    description,
    workout_structure ? JSON.stringify(workout_structure) : null,
    intensity,
    id,
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteRegimentById = async (id) => {
  const query = `
    DELETE FROM regiments
    WHERE regiment_id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
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
