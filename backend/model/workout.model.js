import db from "../config/db.js";

const intensityLookup = {
  "1 Arm Extension": 3,
  "Barbell Press": 4,
  "Bicep Curl": 3,
  "Bench Press": 4,
  "Burpees": 5,
  "Cable Crunches": 4,
  "Cable high to lows": 4,
  "Cable Inverse Bicep": 3,
  "Cable Pushdown with Bar": 3,
  "Cable Rope Curls": 3,
  "Cable Side Obliques": 3,
  "Cable Shrugs": 3,
  "Calf Raise": 3,
  "Calf Raise Legpress": 3,
  "Chest Press Machine": 4,
  "Chest Raise": 3,
  "Crab Lift": 3,
  "Cross Cable Triceps": 3,
  "Curls": 3,
  "DB Incline Press": 4,
  "DB Shoulder Press": 4,
  "Db Flat Press": 4,
  "D handle rows": 4,
  "Deadlift": 5,
  "EZ bar curls": 3,
  "Extension": 4,
  "Facepull": 3,
  "Forearm Machine Reverse Grip": 3,
  "Hammer Curls": 3,
  "Hammer Rope Curls": 3,
  "Hack Squat": 4,
  "Incline Dumbell Fly": 3,
  "Incline Press": 4,
  "Incline machine": 4,
  "Jog with Ankle Weights": 3,
  "Jumping Jacks": 2,
  "Kettle Bell Obliques Back Extention Machine": 3,
  "Lat Focused Row": 4,
  "Lat Pulldowns": 4,
  "Lat Push Downs": 4,
  "Lat Raise": 3,
  "Leg Press": 4,
  "Leg extensions": 4,
  "Legpress Close": 4,
  "Legraise": 3,
  "Lateral Raises": 3,
  "Lunges": 3,
  "Mudgal": 2,
  "Normal Crunches": 2,
  "Over Head Tricep Extension": 3,
  "OverHead Rope ext": 3,
  "Overhead Extension": 3,
  "Pec Deck": 4,
  "Plank": 2,
  "Preacher Curls": 3,
  "Pull Ups": 5,
  "Pull-up": 5,
  "Push-up": 3,
  "Pushup Crunches": 3,
  "Rear Deltoid Machine": 3,
  "Rear Delt Flys": 3,
  "Rope Slam": 4,
  "Rope Waves": 4,
  "Russian Twist": 3,
  "Seated Cable Extension (Top Position)": 3,
  "Seated Incline Curls": 3,
  "Shoulder Press": 4,
  "Shoulder Press machine": 4,
  "Shrugs": 3,
  "Smith machine row": 4,
  "Squat": 4,
  "Squats Wide": 4,
  "Stick Tied with Plate Rolling": 2,
  "Supine Lat Pull Close Grip": 4,
  "T bar row": 4,
  "Tricep PushDowns": 3,
  "X Crunches": 3,
  "Sled Push": 5,
  "Tire Flip": 5,
  "Diamond Pushup": 4,
  "Bear Walk": 4,
  "Surya Namaskar": 3,
  "Supine Lat Pull": 4,
  "Plank": 2,
  "Step Up": 3,
  "DB Incline Press": 8,
  "Incline machine": 7,
  "Cable high to lows": 5,
  "Chest Press Machine": 7,
  "DB Shoulder Press": 7,
  "Lateral Raises": 4,
  "Pec Deck": 5,
  "Lat Pulldowns": 8,
  "Lat Push Downs": 6,
  "D handle rows": 6,
  "qmhgxvhj": 0,
  "Hammer Rope Curls": 4,
  "EZ bar curls": 5,
  "Tricep PushDowns": 5,
  "OverHead Rope ext": 5,
  "Leg extensions": 5,
  "Squats": 10,
  "Hack Squat": 9,
  "Hamstring Curls": 5,
  "Calf Raiese": 3,
  "Leg Press": 9,
  "egr3x4gk": 0,
  "T bar row": 8,
  "Smith machine row": 7,
  "Rear Delt Flys": 4,
  "Db Flat Press": 8,
  "Shoulder Press": 7,
  "Shoulder Press machine": 6,
  "Rear Deltoid Machine": 5,
  "Over Head Tricep Extension": 5,
  "Seated Incline Curls": 4,
  "6s4593pk": 0,
  "Barbell Press": 9,
  "Incline Press": 8,
  "Incline Dumbell Fly": 6,
  "Chest Raise": 4,
  "Cable Inverse Bicep": 3,
  "Cable Pushdown with Bar": 5,
  "Cross Cable Triceps": 5,
  "1 Arm Extension": 4,
  "Seated Cable Extension (Top Position)": 4,
  "Deadlift": 10,
  "Lat Pulldown": 8,
  "Cable Shrugs": 2,
  "Preacher Curls": 4,
  "Hammer Curls": 4
};

const calculateIntensityWithBreakdown = (structure, intensityLookup, existingExercises) => {
  const breakdown = [];
  let total = 0;
  let totalSets = 0;

  const normalize = (value) => {
    const scaled = Math.pow(value / 20, 0.7) * 10;
    return Math.min(10, Math.max(1, parseFloat(scaled.toFixed(2))));
  };

  for (const item of structure) {
    const exercise = existingExercises.find(
      (e) => e.exercise_id === item.exercise_id
    );
    const name = exercise?.name;
    // If name is missing, skip. If not in lookup, use 3 as baseIntensity.
    if (!name) continue;

    const baseIntensity = (name in intensityLookup) ? intensityLookup[name] : 3;
    const adjustedIntensity = baseIntensity / 1.5;

    const setScores = [];

    const setsArray = Array.isArray(item.sets)
      ? item.sets
      : Object.values(item.sets || {});

    const units = item.units || [];

    for (const set of setsArray) {
      const reps = units.includes("reps") ? Math.min(20, parseFloat(set.reps) || 0) : 0;
      let weight = units.includes("weight") ? Math.min(100, parseFloat(set.weight) || 0) : 0;
      const time = units.includes("time") ? parseFloat(set.time) || 0 : 0;
      const laps = units.includes("laps") ? parseFloat(set.laps) || 0 : 0;
      // console.log(reps,weight,time,laps)
      if (item.weight_unit === "lbs") weight *= 0.453592;

      const repFactor = Math.log10(reps + 1);
      const weightFactor = Math.log10(weight + 1);
      const timeFactor = time > 0 ? time * 0.1 : 1;
      const lapFactor = laps > 0 ? laps * 0.3 : 1;

      const rawScore = adjustedIntensity * (1 + repFactor + weightFactor) * timeFactor * lapFactor;
      const normalizedScore = normalize(rawScore);
      setScores.push(normalizedScore);
      total += normalizedScore;
    }

    totalSets += setScores.length;

    breakdown.push({
      exercise: name,
      setScores,
      exerciseTotal: parseFloat(
        setScores.reduce((a, b) => a + b, 0).toFixed(2)
      ),
    });
  }

  const normalizedIntensity = normalize(total / (totalSets || 1));
  return {
    breakdown,
    totalIntensity: parseFloat(total.toFixed(2)),
    normalizedIntensity
  };
};

const checkExists = async (table, idName, id) => {
  const query = `SELECT 1 FROM ${table} WHERE ${idName} = $1 LIMIT 1`;
  const { rowCount } = await db.query(query, [id]);
  return rowCount > 0;
};

// Exercise Functions
const recordExercise = async ({
  name,
  description,
  muscle_group,
  units,
  created_by
}) => {
  // Check for duplicate exercise
  const normalizedName = name.toLowerCase().replace(/\s+/g, '');

  const duplicateCheckQuery = `
  SELECT 1 FROM exercises
  WHERE REPLACE(LOWER(name), ' ', '') = $1
    AND created_by = $2
  LIMIT 1;
`;

  const duplicateCheck = await db.query(duplicateCheckQuery, [normalizedName, created_by]);
  if (duplicateCheck.rowCount > 0) {
    throw new Error("Exercise already present (normalized match)");
  }

  // Determine intensity from lookup (default to 3 if not found)
  const intensity = intensityLookup[name] || 3;

  // Convert JS array to Postgres array string
  const pgUnitsArray =
    units && Array.isArray(units) ? `{${units.join(",")}}` : null;

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
    intensity
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

//workout
const recordWorkout = async ({ name, created_by, description, structure }) => {
  // Duplicate check
  const duplicateCheckQuery = `
    SELECT 1 FROM workouts WHERE name = $1 AND created_by = $2 LIMIT 1;
  `;
  const duplicateCheck = await db.query(duplicateCheckQuery, [
    name,
    created_by,
  ]);
  if (duplicateCheck.rowCount > 0) {
    throw new Error("Workout already present");
  }

  // Validate exercise ids
  const exerciseIds = structure.map((item) => item.exercise_id);
  const checkQuery = `
    SELECT exercise_id, name
    FROM exercises
    WHERE exercise_id = ANY($1)
  `;
  const { rows: existingExercises } = await db.query(checkQuery, [exerciseIds]);

  const existingIds = existingExercises.map((e) => e.exercise_id);
  const missingIds = exerciseIds.filter((id) => !existingIds.includes(id));

  if (missingIds.length > 0) {
    throw new Error(`Invalid exercise_id(s): ${missingIds.join(", ")}`);
  }
  // ✅ Use shared calculate function
  const { breakdown, totalIntensity, normalizedIntensity } =
    calculateIntensityWithBreakdown(
      structure,
      intensityLookup,
      existingExercises
    );

  const intensityPayload = {
    breakdown,
    totalIntensity,
    normalizedIntensity,
  };

  structure.forEach((item) => {
    if (item.units.includes("laps") && !item.laps_unit) {
      throw new Error(`Missing laps_unit for exercise_id ${item.exercise_id}`);
    }
  });

  const insertQuery = `
  INSERT INTO workouts (name, created_by, description, structure, intensity)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

  const values = [
    name,
    created_by,
    description,
    JSON.stringify(structure), // this is fine, structure is stored as TEXT/JSON
    intensityPayload, // this must be a plain JS object for JSONB
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

  // If intensity is a string, parse it
  if (typeof workout.intensity === "string") {
    try {
      workout.intensity = JSON.parse(workout.intensity);
    } catch (err) {
      console.warn(`Invalid intensity JSON for workout ID ${id}`, err);
      workout.intensity = {}; // fallback to empty
    }
  }
  // console.log("🔥 Raw workout data from DB:", workout);
  // console.log("🔥 Raw intensity type:", typeof workout.intensity, workout.intensity);

  // ✅ Parse JSON if needed
  try {
    if (typeof workout.structure === "string") {
      workout.structure = JSON.parse(workout.structure);
    }
    if (typeof workout.intensity === "string") {
      workout.intensity = JSON.parse(workout.intensity);
    }
  } catch (err) {
    console.error("❌ JSON parse error:", err);
    // Optionally throw or continue
  }

  // ✅ Attach exercise details
  const structure = workout.structure;
  const exerciseIds = Array.isArray(structure)
    ? structure.map((item) => item.exercise_id).filter(Boolean)
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

    workout.structure = structure.map((item) => ({
      ...item,
      exercise_details: exercisesMap[item.exercise_id] || null,
    }));
  }

  return workout;
};

const updateWorkoutById = async (id, { name, description, structure }) => {
  // Check for duplicate name
  if (name) {
    const duplicateCheckQuery = `
      SELECT 1 FROM workouts WHERE name = $1 AND workout_id != $2 LIMIT 1;
    `;
    const duplicateCheck = await db.query(duplicateCheckQuery, [name, id]);
    if (duplicateCheck.rowCount > 0) {
      throw new Error("Workout name already present");
    }
  }

  let finalStructure = structure;
  let intensityPayload = null;

  // 🟡 If structure not provided, fetch from DB
  if (!structure) {
    const fetchQuery = `SELECT structure FROM workouts WHERE workout_id = $1`;
    const { rows } = await db.query(fetchQuery, [id]);
    if (rows.length === 0) {
      throw new Error("Workout not found");
    }
    finalStructure = rows[0].structure;
  }

  // 🔵 Validate and recalculate intensity
  const exerciseIds = finalStructure.map((item) => item.exercise_id);
  const checkQuery = `
    SELECT exercise_id, name
    FROM exercises
    WHERE exercise_id = ANY($1)
  `;
  const { rows: existingExercises } = await db.query(checkQuery, [exerciseIds]);

  const existingIds = existingExercises.map((e) => e.exercise_id);
  const missingIds = exerciseIds.filter((id) => !existingIds.includes(id));
  if (missingIds.length > 0) {
    throw new Error(`Invalid exercise_id(s): ${missingIds.join(", ")}`);
  }

  // 🔴 Check for laps_unit
  finalStructure.forEach((item) => {
    if (item.units.includes("laps") && !item.laps_unit) {
      throw new Error(`Missing laps_unit for exercise_id ${item.exercise_id}`);
    }
  });

  // ✅ Calculate intensity payload
  intensityPayload = calculateIntensityWithBreakdown(
    finalStructure,
    intensityLookup,
    existingExercises
  );

  // 🔁 Update query
  const query = `
    UPDATE workouts
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        structure = COALESCE($3, structure),
        intensity = COALESCE($4, intensity)
    WHERE workout_id = $5
    RETURNING *;
  `;

  const values = [
    name,
    description,
    structure ? JSON.stringify(structure) : null,
    intensityPayload ? JSON.stringify(intensityPayload) : null,
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

//logs
const recordWorkoutLog = async ({
  user_id,
  regiment_id,
  planned_workout_id,
  actual_workout,
  timee,
}) => {
  // ✅ Validate references
  if (!(await checkExists("regiments", "regiment_id", regiment_id))) {
    throw new Error(`Regiment with id ${regiment_id} does not exist.`);
  }
  if (!(await checkExists("workouts", "workout_id", planned_workout_id))) {
    throw new Error(`Workout not found.`);
  }
  for (const exercise of actual_workout) {
    if (
      !(await checkExists("exercises", "exercise_id", exercise.exercise_id))
    ) {
      throw new Error(`Exercise with ID ${exercise.exercise_id} not found.`);
    }
  }

  // ✅ Fetch exercise names for intensity calculation
  const exerciseIds = actual_workout.map((item) => item.exercise_id);
  const checkQuery = `
    SELECT exercise_id, name
    FROM exercises
    WHERE exercise_id = ANY($1)
  `;
  const { rows: existingExercises } = await db.query(checkQuery, [exerciseIds]);

  // ✅ Add `units` array to each item based on its set keys
  const enrichedWorkout = actual_workout.map((item) => {
    const sets = Array.isArray(item.sets)
      ? item.sets
      : Object.values(item.sets || {});

    const sampleSet = sets[0] || {};

    const possibleUnits = ["reps", "weight", "time", "laps"];
    const detectedUnits = possibleUnits.filter(
      (unit) => sampleSet[unit] !== undefined && sampleSet[unit] !== ""
    );

    return {
      ...item,
      sets,
      units: detectedUnits,
    };
  });

  // ✅ Calculate full intensity breakdown
  const { breakdown, totalIntensity, normalizedIntensity } =
    calculateIntensityWithBreakdown(
      enrichedWorkout,
      intensityLookup,
      existingExercises
    );

  const intensityPayload = {
    breakdown,
    totalIntensity,
    normalizedIntensity,
  };

  // console.log("🏋️‍♂️ Intensity breakdown for workout log:", intensityPayload);

  // ✅ Insert into DB
  const query = `
    INSERT INTO workout_logs (
      user_id,
      regiment_id,
      planned_workout_id,
      actual_workout,
      intensity,
      timee
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    user_id,
    regiment_id,
    planned_workout_id,
    JSON.stringify(enrichedWorkout),
    JSON.stringify(intensityPayload),
    timee,
  ];

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
    LEFT JOIN users u ON wl.user_id = u.id
    LEFT JOIN workouts w ON wl.planned_workout_id = w.workout_id
    LEFT JOIN regiments r ON wl.regiment_id = r.regiment_id
    WHERE wl.user_id = $1
    ORDER BY wl.created_at DESC NULLS LAST
    LIMIT $2 OFFSET $3;
  `;

  const { rows } = await db.query(query, [user_id, limit, offset]);

  // 🔧 Safely parse intensity for each row
  return rows.map((row) => {
    if (typeof row.intensity === "string") {
      try {
        row.intensity = JSON.parse(row.intensity);
      } catch (err) {
        console.warn("⚠️ Failed to parse intensity JSON:", err);
        row.intensity = {}; // fallback
      }
    }
    return row;
  });
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

const updateWorkoutLogById = async (
  workout_log_id,
  { actual_workout, score }
) => {
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

const deleteWorkoutLogById = async (workout_log_id) => {
  // not in use
  const query = `
    DELETE FROM workout_logs
    WHERE workout_log_id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [workout_log_id]);
  return rows[0];
};

//regiment
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
  const duplicateCheck = await db.query(duplicateCheckQuery, [
    name,
    created_by,
  ]);
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

  const scores = workouts.map((w) =>
    Number(w.intensity?.normalizedIntensity || 0)
  );
  const totalScore = scores.reduce((acc, val) => acc + val, 0);
  const regimentIntensity = Math.min(
    10,
    Math.max(1, Number(totalScore.toFixed(2)))
  );
  // console.log(`Average Score: ${averageScore}, Regiment Intensity: ${regimentIntensity}`);

  const structured = workout_structure.map((day) => ({
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
    JSON.stringify(structured),
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

  if (typeof regiment.workout_structure === "string") {
    try {
      const parsed = JSON.parse(regiment.workout_structure);
      regiment.workout_structure = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(
        "⚠️ Malformed workout_structure JSON. Using empty array as fallback."
      );
      regiment.workout_structure = [];
    }
  }

  const workoutIds = regiment.workout_structure
    ?.map((day) => day.workout_id)
    .filter((wid) => typeof wid === "number");

  if (workoutIds?.length > 0) {
    const workoutsQuery = `
      SELECT workout_id, name, description, structure, intensity
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
        const structure =
          typeof workout.structure === "string"
            ? JSON.parse(workout.structure)
            : workout.structure;
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
          workout.structure =
            typeof workout.structure === "string"
              ? JSON.parse(workout.structure)
              : workout.structure;
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

const updateRegimentById = async (
  id,
  { name, description, workout_structure }
) => {
  // 🔍 Duplicate name check
  if (name) {
    const duplicateCheckQuery = `
      SELECT 1 FROM regiments WHERE name = $1 AND regiment_id != $2 LIMIT 1;
    `;
    const duplicateCheck = await db.query(duplicateCheckQuery, [name, id]);
    if (duplicateCheck.rowCount > 0) {
      throw new Error("Regiment name already present");
    }
  }

  // 🧠 Fetch workout IDs and their scores
  const workoutIds = workout_structure.map((day) => day.workout_id);
  const scoreQuery = `
    SELECT workout_id, intensity
    FROM workouts
    WHERE workout_id = ANY($1)
  `;
  const { rows: workouts } = await db.query(scoreQuery, [workoutIds]);

  // ✅ Validate workout IDs
  const existingWorkoutIds = workouts.map((w) => w.workout_id);
  const missingWorkoutIds = workoutIds.filter(
    (id) => !existingWorkoutIds.includes(id)
  );
  if (missingWorkoutIds.length > 0) {
    throw new Error(`Workout ID(s) not found: ${missingWorkoutIds.join(", ")}`);
  }

  // 📊 Compute total intensity from scores (scale 1–10)
  const scores = workouts.map((w) => Number(w.score) || 0);
  const totalScore = scores.reduce((acc, val) => acc + val, 0);
  const intensity = Math.min(
    10,
    Math.max(1, parseFloat(totalScore.toFixed(2)))
  );

  // 📝 Update query
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

const setCurrentRegiment = async (req, res) => {
  const { id, regiment_id } = req.body;

  if (!id || !regiment_id) {
    return res
      .status(400)
      .json({ error: { message: "User ID and Regiment ID required." } });
  }

  try {
    // Remove existing "current" entry for the user
    await db.query(`DELETE FROM user_current_regiment WHERE id = $1`, [id]);

    // Insert new current regiment
    await db.query(
      `INSERT INTO user_current_regiment (id, regiment_id) VALUES ($1, $2)`,
      [id, regiment_id]
    );

    res.status(200).json({ message: "Current regiment set successfully." });
  } catch (err) {
    console.error("DB Error in setCurrentRegiment:", err);
    res
      .status(500)
      .json({ error: { message: "Failed to update current regiment." } });
  }
};

const getCurrentRegimentForUser = async (req, res) => {
  try {
    const { id } = req.params; // user ID from URL parameter

    const query = `
      SELECT regiment_id
      FROM user_current_regiment
      WHERE id = $1
      LIMIT 1;
    `;
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(200).json({ regiment_id: null }); // instead of 404
    }
    res.json({ regiment_id: rows[0].regiment_id });
  } catch (error) {
    console.error("Error fetching current regiment:", error);
    res.status(500).json({ message: "Failed to fetch current regiment" });
  }
};

const deleteCurrentRegimentFromStatus = async (req, res) => {
  const { id } = req.params; // this is userId
  console.log(id)
  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  try {
    const { rowCount } = await db.query(
      `DELETE FROM user_current_regiment WHERE id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return res.status(200).json({
        message:
          "You’ve started this regiment but haven’t completed all workouts. To switch to a new regiment, use the 'Make Current' button.",
        status: "partial",
      });
    }

    res.status(200).json({ message: "Current regiment removed", status: "success" });
  } catch (err) {
    console.log("❌ Error deleting current regiment:", err);
    res.status(500).json({ message: "Failed to remove current regiment" });
  }
};

const fetchHighestIntensityWorkout = async (userId) => {
  const currentDate = new Date();
  const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);

  const result = {
    week: null,
    month: null,
    year: null
  };

  // Generic query to get max intensity day in a range
  const dateRangeQuery = `
    SELECT 
      DATE(wl.created_at) AS log_date,
      SUM((wl.intensity->>'normalizedIntensity')::NUMERIC) AS total_intensity
    FROM workout_logs wl
    WHERE wl.user_id = $1 AND wl.created_at >= $2
    GROUP BY log_date
    ORDER BY total_intensity DESC
    LIMIT 1;
  `;

  const getTopDayInRange = async (fromDate) => {
    const { rows } = await db.query(dateRangeQuery, [userId, fromDate]);
    return rows[0] || null;
  };

  const formatDayResult = (row) => {
    return {
      date: row.log_date,
      total_intensity: parseFloat(row.total_intensity)
    };
  };

  // Fetch for each range
  const weekTop = await getTopDayInRange(weekAgo);
  if (weekTop) result.week = formatDayResult(weekTop);

  const monthTop = await getTopDayInRange(monthAgo);
  if (monthTop) result.month = formatDayResult(monthTop);

  const yearTop = await getTopDayInRange(yearAgo);
  if (yearTop) result.year = formatDayResult(yearTop);

  return result;
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
  setCurrentRegiment,
  getCurrentRegimentForUser,
  deleteCurrentRegimentFromStatus,
  fetchHighestIntensityWorkout,
  // user_regiment_progress,
  // recordProgress,
};