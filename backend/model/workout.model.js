import db from "../config/db.js"

// Exercise Functions
const recordExercise = async ({
  name,
  description,
  muscle_group,
  units,
  created_by,
  intensity,
}) => {
  // Check for duplicate exercise
  const duplicateCheckQuery = `
    SELECT 1 FROM exercises WHERE name = $1 AND created_by = $2 LIMIT 1;
  `;
  const duplicateCheck = await db.query(duplicateCheckQuery, [name, created_by]);
  if (duplicateCheck.rowCount > 0) {
    throw new Error("Exercise already present");
  }

  // Convert JS array to Postgres array string
  const pgUnitsArray = units && Array.isArray(units) ? `{${units.join(",")}}` : null;

  const query = `
    INSERT INTO exercises (name, description, muscle_group, units, created_by, intensity)
    VALUES ($1, $2, $3, $4::TEXT[], $5, $6)
    RETURNING *;
  `;
  const values = [
    name,
    description,
    muscle_group,
    pgUnitsArray,
    created_by,
    intensity,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};


const fetchAllExercises = async () => {
  const query = `
    SELECT e.*, u.first_name AS created_by_name
    FROM exercises e
    LEFT JOIN users u ON e.created_by = u.id
    ORDER BY e.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const fetchExerciseById = async (id) => {
  const query = `
    SELECT e.*, u.first_name as created_by_name
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
// Workout Functions
const intensityLookup = {
  "Push-up": 3,
  "Squat": 4,
  "Deadlift": 5,
  "Bench Press": 4,
  "Plank": 2,
  "Pull-up": 5,
  "Jumping Jacks": 2,
  "Bicep Curl": 3,
  "Lunges": 3,
  "Burpees": 5,
};

const calculateScoreFromStructure = (structure, intensityLookup, existingExercises) => {
  let totalScore = 0;

  for (const item of structure) {
    const exercise = existingExercises.find(e => e.exercise_id === item.exercise_id);
    const exerciseName = exercise?.name;
    if (!exerciseName || !(exerciseName in intensityLookup)) continue;

    const baseIntensity = intensityLookup[exerciseName];

    for (const key in (item.sets || {})) {
      const set = item.sets[key];
      const reps = parseFloat(set.reps) || 1;
      const weight = parseFloat(set.weight) || 1;
      const time = set.time ? (parseFloat(set.time) * 1.5) : 1;
      const laps = set.laps ? (parseFloat(set.laps) * 3) : 1;

      const setScore = baseIntensity * reps * weight * time * laps;
      totalScore += setScore;
    }
  }

  let normalizedScore = totalScore / 1000;
  normalizedScore = Math.min(10, Math.max(1, normalizedScore.toFixed(2)));
  return parseFloat(normalizedScore);
};


const recordWorkout = async ({ name, created_by, description, structure }) => {
  // Duplicate check
  const duplicateCheckQuery = `
    SELECT 1 FROM workouts WHERE name = $1 AND created_by = $2 LIMIT 1;
  `;
  const duplicateCheck = await db.query(duplicateCheckQuery, [name, created_by]);
  if (duplicateCheck.rowCount > 0) {
    throw new Error("Workout already present");
  }

  // Validate exercise ids
  const exerciseIds = structure.map(item => item.exercise_id);
  const checkQuery = `
    SELECT exercise_id, name
    FROM exercises
    WHERE exercise_id = ANY($1)
  `;
  const { rows: existingExercises } = await db.query(checkQuery, [exerciseIds]);

  const existingIds = existingExercises.map(e => e.exercise_id);
  const missingIds = exerciseIds.filter(id => !existingIds.includes(id));

  if (missingIds.length > 0) {
    throw new Error(`Invalid exercise_id(s): ${missingIds.join(', ')}`);
  }

  // Intensity lookup map
  // const intensityLookup = {
  //   "Bench Press": 3,
  //   "Squats": 4,
  //   "Deadlift": 5,
  //   "Pushups": 2,
  //   "Pullups": 3.5,
  //   // Add your full list here
  // };

  // ✅ Use shared calculate function
  const finalScore = calculateScoreFromStructure(structure, intensityLookup, existingExercises);

  console.log(`Normalized Score: ${finalScore}`);

  const insertQuery = `
    INSERT INTO workouts (name, created_by, description, structure, score)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    name,
    created_by,
    description,
    JSON.stringify(structure),
    finalScore
  ];

  const { rows } = await db.query(insertQuery, values);
  return rows[0];
};


const fetchAllWorkouts = async () => {
  const query = `
    SELECT w.*, u.first_name AS created_by_name
    FROM workouts w
    LEFT JOIN users u ON w.created_by = u.id
    ORDER BY w.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const fetchWorkoutById = async (id) => {
  const workoutQuery = `
    SELECT w.*, u.first_name AS created_by_name
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
      SELECT exercise_id, name, description, muscle_group, units
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

const updateWorkoutById = async (id, { name, description, structure, score }) => {
  // Duplicate name check if updating name
  if (name) {
    const duplicateCheckQuery = `
      SELECT 1 FROM workouts WHERE name = $1 AND workout_id != $2 LIMIT 1;
    `;
    const duplicateCheck = await db.query(duplicateCheckQuery, [name, id]);
    if (duplicateCheck.rowCount > 0) {
      throw new Error("Workout name already present");
    }
  }

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
    id
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
  // status = "not started"
}) => {
  // Validate references
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

  // ✅ Fetch exercise names (needed for intensity lookup)
  const exerciseIds = actual_workout.map(item => item.exercise_id);
  const checkQuery = `
    SELECT exercise_id, name
    FROM exercises
    WHERE exercise_id = ANY($1)
  `;
  const { rows: existingExercises } = await db.query(checkQuery, [exerciseIds]);

  // ✅ Intensity lookup (should ideally be a centralized shared constant)
  const intensityLookup = {
    "Bench Press": 3,
    "Squats": 4,
    "Deadlift": 5,
    "Pushups": 2,
    "Pullups": 3.5,
    // Add full list
  };

  // ✅ Calculate score based on actual workout using shared function
  const calculatedScore = calculateScoreFromStructure(actual_workout, intensityLookup, existingExercises);

  console.log(`Calculated Score for Workout Log: ${calculatedScore}`);

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
    calculatedScore
  ];
  ;
  const { rows } = await db.query(query, values);
  return rows[0];
};


const fetchUserWorkoutLogs = async (user_id, limit = 50, offset = 0) => {
  const query = `
    SELECT wl.*,
           u.first_name,
           w.name AS planned_workout_name,
           r.name AS regiment_name
    FROM workout_logs wl
    LEFT JOIN users u ON wl.user_id = u.id  -- Corrected here
    LEFT JOIN workouts w ON wl.planned_workout_id = w.workout_id
    LEFT JOIN regiments r ON wl.regiment_id = r.regiment_id
    WHERE wl.user_id = $1
    ORDER BY wl.log_date DESC, wl.created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const { rows } = await db.query(query, [user_id, limit, offset]);
  return rows;
};

const fetchWorkoutLogById = async (workout_log_id) => {
  const query = `
    SELECT wl.*,
           u.first_name,
           w.name AS planned_workout_name,
           w.structure AS planned_workout_structure,
           r.name AS regiment_name
    FROM workout_logs wl
    LEFT JOIN users u ON wl.user_id = u.id  -- Corrected here
    LEFT JOIN workouts w ON wl.planned_workout_id = w.workout_id
    LEFT JOIN regiments r ON wl.regiment_id = r.regiment_id
    WHERE wl.workout_log_id = $1;
  `;
  const { rows } = await db.query(query, [workout_log_id]);
  return rows[0];
};


// Update workout log
const updateWorkoutLogById = async (workout_log_id, { actual_workout, score }) => {
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
    workout_log_id,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Delete workout log
const deleteWorkoutLogById = async (workout_log_id) => {
  const query = `
    DELETE FROM workout_logs
    WHERE workout_log_id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [workout_log_id]);
  return rows[0];
};


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
    SELECT workout_id, score
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

  // ✅ Compute intensity from scores (direct average on 1-10 scale)
  const scores = workouts.map((w) => Number(w.score) || 0);
  const averageScore =
    scores.reduce((acc, val) => acc + val, 0) / scores.length;

  let regimentIntensity = Math.min(10, Math.max(1, averageScore.toFixed(2)));

  console.log(`Average Score: ${averageScore}, Regiment Intensity: ${regimentIntensity}`);

  // ✅ Add default status to each workout day
  const structuredWithStatus = workout_structure.map(day => ({
    ...day,
  }));

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
    JSON.stringify(structuredWithStatus),
    regimentIntensity,
  ];

  const { rows } = await db.query(insertQuery, values);
  return rows[0];
};


const fetchAllRegiments = async () => {
  const query = `
    SELECT 
      r.regiment_id,
      r.created_by,
      u.first_name AS created_by_name,
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

// // Test query - add this temporarily
// const testQuery = `
//   SELECT table_name, column_name 
//   FROM information_schema.columns 
//   WHERE table_name IN ('users', 'regiments')
//   ORDER BY table_name, column_name;
// `;
// const result = await db.query(testQuery);
// console.log('Database structure:', result.rows);

const fetchRegimentById = async (id) => {
  const regimentQuery = `
    SELECT 
      r.regiment_id,
      r.name,
      r.description,
      r.workout_structure,
      r.intensity,
      r.created_by,
      r.created_at,
      u.first_name AS created_by_name
    FROM regiments r
    LEFT JOIN users u ON r.created_by = u.id
    WHERE r.regiment_id = $1;
  `;

  const regimentResult = await db.query(regimentQuery, [id]);

  if (regimentResult.rows.length === 0) return null;

  const regiment = regimentResult.rows[0];

  console.log("✅ Regiment result:", regiment);

  if (typeof regiment.workout_structure === 'string') {
    try {
      regiment.workout_structure = JSON.parse(regiment.workout_structure);
    } catch (err) {
      console.error("❌ Invalid JSON in workout_structure:", err);
      throw new Error("Invalid workout_structure format in DB");
    }
  }

  const workoutIds = regiment.workout_structure
    ?.map((day) => day.workout_id)
    .filter((wid) => typeof wid === 'number');

  if (workoutIds?.length > 0) {
    const workoutsQuery = `
      SELECT workout_id, name, description, structure, score
      FROM workouts
      WHERE workout_id = ANY($1);
    `;

    const workoutsResult = await db.query(workoutsQuery, [workoutIds]);

    const workoutsMap = workoutsResult.rows.reduce((acc, workout) => {
      acc[workout.workout_id] = workout;
      return acc;
    }, {});

    // Extract unique exercise IDs from all workouts
    const allExerciseIds = new Set();
    workoutsResult.rows.forEach((workout) => {
      try {
        const structure = typeof workout.structure === 'string' ? JSON.parse(workout.structure) : workout.structure;
        structure?.forEach((ex) => {
          if (ex.exercise_id) allExerciseIds.add(ex.exercise_id);
        });
      } catch (err) {
        console.error("❌ Error parsing workout structure:", err);
      }
    });

    // Fetch exercise names
    const exerciseQuery = `
      SELECT exercise_id, name FROM exercises WHERE exercise_id = ANY($1);
    `;
    const exerciseResult = await db.query(exerciseQuery, [[...allExerciseIds]]);
    const exerciseMap = exerciseResult.rows.reduce((acc, ex) => {
      acc[ex.exercise_id] = ex.name;
      return acc;
    }, {});

    // Attach workout_details and enrich structure with exercise name
    regiment.workout_structure = regiment.workout_structure.map((day) => {
      const workout = workoutsMap[day.workout_id] || null;
      if (workout && workout.structure) {
        try {
          workout.structure = typeof workout.structure === 'string' ? JSON.parse(workout.structure) : workout.structure;
          workout.structure = workout.structure.map((ex) => ({
            ...ex,
            exercise_details: {
              name: exerciseMap[ex.exercise_id] || null,
            },
          }));
        } catch (err) {
          console.error("❌ Error parsing/enriching workout structure:", err);
        }
      }
      return {
        ...day,
        workout_details: workout,
      };
    });
  }
  return regiment;
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

  const intensity = 1;

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


// const user_regiment_progress = async (req, res) => {
//   const { regiment_id, user_id } = req.body;

//   try {
//     // 1. Fetch the original regiment
//     const regimentResult = await db.query(
//       "SELECT workout_structure FROM regiments WHERE regiment_id = $1",
//       [regiment_id]
//     );

//     if (regimentResult.rowCount === 0) {
//       return res.status(404).json({ error: "Regiment not found" });
//     }

//     const baseStructure = regimentResult.rows[0].workout_structure;

//     // 2. Prepare structure with status = "not_started"
//     const structureWithStatus = baseStructure.map((entry) => ({
//       ...entry,
//       status: "not_started",
//     }));

//     // 3. Check if user_regiment_progress already exists
//     const existing = await db.query(
//       "SELECT * FROM user_regiment_progress WHERE user_id = $1 AND regiment_id = $2",
//       [user_id, regiment_id]
//     );

//     if (existing.rowCount > 0) {
//       // 4. Update existing progress
//       await db.query(
//         "UPDATE user_regiment_progress SET workout_structure = $1, updated_at = NOW() WHERE user_id = $2 AND regiment_id = $3",
//         [structureWithStatus, user_id, regiment_id]
//       );
//       return res.status(200).json({ message: "Progress updated successfully" });
//     } else {
//       // 5. Create new progress record
//       await db.query(
//         "INSERT INTO user_regiment_progress (user_id, regiment_id, workout_structure) VALUES ($1, $2, $3)",
//         [user_id, regiment_id, structureWithStatus]
//       );
//       return res.status(201).json({ message: "Progress created successfully" });
//     }

//   } catch (error) {
//     console.error("Error in user_regiment_progress:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };


// POST /workouts/progress
const recordProgress = async (req, res) => {
  const { user_id, regiment_id, workout_id, status } = req.body;
  try {
    const query = `
      INSERT INTO user_regiment_progress (user_id, regiment_id, workout_id, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, regiment_id, workout_id)
      DO UPDATE SET status = EXCLUDED.status;
    `;
    await db.query(query, [user_id, regiment_id, workout_id, status]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error recording progress:", err);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

const getCurrentRegimentForUser = async (req, res) => {
  const user_id = Number(req.params.user_id);

  try {
    // 1. Get all regiment IDs the user has progress on
    const regimentIdsQuery = `
      SELECT DISTINCT regiment_id
      FROM user_regiment_progress
      WHERE user_id = $1
    `;
    const regimentIdsRes = await db.query(regimentIdsQuery, [user_id]);
    const regimentIds = regimentIdsRes.rows.map(r => r.regiment_id);

    if (regimentIds.length === 0) {
      return res.status(200).json({ regiment: null, message: "No active regiment" });
    }

    for (const regiment_id of regimentIds) {
      const progressQuery = `
        SELECT COUNT(*) FILTER (WHERE status = 'completed') AS completed,
               COUNT(*) AS total
        FROM user_regiment_progress
        WHERE user_id = $1 AND regiment_id = $2
      `;
      const { rows } = await db.query(progressQuery, [user_id, regiment_id]);
      const { completed, total } = rows[0];

      if (Number(completed) < Number(total)) {
        // Found the in-progress regiment
        const regimentQuery = `
          SELECT * FROM regiments WHERE regiment_id = $1;
        `;
        const regimentRes = await db.query(regimentQuery, [regiment_id]);
        return res.status(200).json({ regiment: regimentRes.rows[0] });
      }
    }

    // All regiments are completed
    return res.status(200).json({ regiment: null, message: "All regiments completed" });

  } catch (err) {
    console.error("Error fetching current regiment:", err);
    res.status(500).json({ error: "Failed to fetch current regiment" });
  }
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
  // user_regiment_progress,
  recordProgress,
  getCurrentRegimentForUser
};