import {
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
} from "../models/workout.model.js";


const recordExerciseEntry = async (req, res) => {
  try {
    const { name, description, muscle_group, units, created_by } = req.body;
    // Validate inputs as needed before passing
    const exercise = await recordExercise({
      name,
      description,
      muscle_group,
      units,
      created_by,
    });
    res.status(201).json({
      item: exercise,
      message: "Exercise recorded successfully",
    });
  } catch (err) {
    console.error("❌ Record Exercise Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to record exercise" } });
  }
};

const fetchAllExercisesList = async (req, res) => {
  try {
    const exercises = await fetchAllExercises();
    res.json({ items: exercises, count: exercises.length });
  } catch (err) {
    console.error("❌ Fetch Exercises Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch exercises" } });
  }
};

const fetchExerciseByIdEntry = async (req, res) => {
  try {
    const exercise = await fetchExerciseById(req.params.id);
    if (!exercise)
      return res.status(404).json({ error: { message: "Exercise not found" } });
    res.json({ item: exercise });
  } catch (err) {
    console.error("❌ Fetch Exercise Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch exercise" } });
  }
};

const updateExerciseByIdEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, muscle_group, units } = req.body;
    const exercise = await updateExerciseById(id, {
      name,
      description,
      muscle_group,
      units,
    });
    if (!exercise)
      return res.status(404).json({ error: { message: "Exercise not found" } });
    res.json({ item: exercise, message: "Exercise updated successfully" });
  } catch (err) {
    console.error("❌ Update Exercise Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to update exercise" } });
  }
};

const deleteExerciseByIdEntry = async (req, res) => {
  try {
    const exercise = await deleteExerciseById(req.params.id);
    if (!exercise)
      return res.status(404).json({ error: { message: "Exercise not found" } });
    res.json({ message: "Exercise deleted successfully", item: exercise });
  } catch (err) {
    console.error("❌ Delete Exercise Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to delete exercise" } });
  }
};
// Validate the workout structure
const validateWorkoutStructure = (structure) => {
  if (!Array.isArray(structure)) return false;

  for (const item of structure) {
    if (
      typeof item !== 'object' ||
      !item.exercise_id ||
      typeof item.sets !== 'object' ||
      Array.isArray(item.sets)
    ) {
      return false;
    }

    for (const key in item.sets) {
      const set = item.sets[key];
      if (
        typeof set !== 'object' ||
        (!('reps' in set) && !('weight' in set) && !('time' in set))
      ) {
        return false;
      }
    }

    if (
      item.weight_unit &&
      !['kg', 'lbs'].includes(item.weight_unit)
    ) {
      return false;
    }

    if (
      item.time_unit &&
      !['seconds', 'minutes'].includes(item.time_unit)
    ) {
      return false;
    }
  }

  return true;
};

const recordWorkoutEntry = async (req, res) => {
  try {
    const { name, created_by, description, structure, score } = req.body;

    if (!validateWorkoutStructure(structure)) {
      return res.status(400).json({
        error: {
          message:
            'Invalid structure format. Please ensure it follows the schema rules.',
        },
      });
    }

    const workout = await recordWorkout({
      name,
      created_by,
      description,
      structure,
      score,
    });

    // Extract all exercise_ids from structure
    const exerciseIds = structure.map((item) => item.exercise_id);

    res.status(201).json({
      item: workout,
      exercise_ids: exerciseIds,
      message: 'Workout recorded successfully',
    });
  } catch (err) {
    console.error('❌ Record Workout Error:', err.stack);

    if (err.message.startsWith('Invalid exercise_id')) {
      return res.status(400).json({
        error: { message: err.message },
      });
    }

    res.status(500).json({
      error: { message: 'Failed to record workout' },
    });
  }
};


const fetchAllWorkoutsList = async (req, res) => {
  try {
    const workouts = await fetchAllWorkouts();
    res.json({ items: workouts, count: workouts.length });
  } catch (err) {
    console.error("❌ Fetch Workouts Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch workouts" } });
  }
};

const fetchWorkoutByIdEntry = async (req, res) => {
  try {
    const workout = await fetchWorkoutById(req.params.id);
    if (!workout)
      return res.status(404).json({ error: { message: "Workout not found" } });
    res.json({ item: workout });
  } catch (err) {
    console.error("❌ Fetch Workout Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch workout" } });
  }
};

const updateWorkoutByIdEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, structure, score } = req.body;
    const workout = await updateWorkoutById(id, {
      name,
      description,
      structure,
      score,
    });
    if (!workout)
      return res.status(404).json({ error: { message: "Workout not found" } });
    res.json({ item: workout, message: "Workout updated successfully" });
  } catch (err) {
    console.error("❌ Update Workout Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to update workout" } });
  }
};

const deleteWorkoutByIdEntry = async (req, res) => {
  try {
    const workout = await deleteWorkoutById(req.params.id);
    if (!workout)
      return res.status(404).json({ error: { message: "Workout not found" } });
    res.json({ message: "Workout deleted successfully", item: workout });
  } catch (err) {
    console.error("❌ Delete Workout Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to delete workout" } });
  }
};
// Validate the actual_workout structure
function validateActualWorkout(actualWorkout) {
  if (!Array.isArray(actualWorkout)) return false;

  return actualWorkout.every(exercise => {
    if (
      typeof exercise !== 'object' ||
      exercise === null ||
      !('exercise_id' in exercise) ||
      typeof exercise.sets !== 'object' ||
      exercise.sets === null ||
      Array.isArray(exercise.sets)
    ) {
      return false;
    }

    const validSets = Object.values(exercise.sets).every(set => {
      if (typeof set !== 'object' || set === null) return false;
      return (
        'reps' in set ||
        'weight' in set ||
        'time' in set
      );
    });

    const validWeightUnit =
      !('weight_unit' in exercise) ||
      ['kg', 'lbs'].includes(exercise.weight_unit);

    const validTimeUnit =
      !('time_unit' in exercise) ||
      ['seconds', 'minutes'].includes(exercise.time_unit);

    return validSets && validWeightUnit && validTimeUnit;
  });
}

const recordWorkoutLogEntry = async (req, res) => {
  try {
    const {
      user_id,
      regiment_id,
      regiment_day_index,
      log_date,
      planned_workout_id,
      actual_workout,
      score,
    } = req.body;

    // Optional: validate actual_workout structure before DB insert
    if (!validateActualWorkout(actual_workout)) {
      return res.status(400).json({ error: { message: "Invalid actual_workout structure" } });
    }

    const log = await recordWorkoutLog({
      user_id,
      regiment_id,
      regiment_day_index,
      log_date,
      planned_workout_id,
      actual_workout,
      score,
    });

    res.status(201).json({ item: log, message: "Workout log recorded successfully" });
  } catch (err) {
    console.error("❌ Record Workout Log Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to record workout log" } });
  }
};


const fetchUserWorkoutLogsList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const logs = await fetchUserWorkoutLogs(userId, limit, offset);
    res.json({ items: logs, count: logs.length });
  } catch (err) {
    console.error("❌ Fetch Workout Logs Error:", err.stack);
    res
      .status(500)
      .json({ error: { message: "Failed to fetch workout logs" } });
  }
};

const fetchWorkoutLogByIdEntry = async (req, res) => {
  try {
    const log = await fetchWorkoutLogById(req.params.id);
    if (!log)
      return res
        .status(404)
        .json({ error: { message: "Workout log not found" } });
    res.json({ item: log });
  } catch (err) {
    console.error("❌ Fetch Workout Log Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch workout log" } });
  }
};

const updateWorkoutLogByIdEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_workout, score } = req.body;
    const log = await updateWorkoutLogById(id, { actual_workout, score });
    if (!log)
      return res
        .status(404)
        .json({ error: { message: "Workout log not found" } });
    res.json({ item: log, message: "Workout log updated successfully" });
  } catch (err) {
    console.error("❌ Update Workout Log Error:", err.stack);
    res
      .status(500)
      .json({ error: { message: "Failed to update workout log" } });
  }
};

const deleteWorkoutLogByIdEntry = async (req, res) => {
  try {
    const log = await deleteWorkoutLogById(req.params.id);
    if (!log)
      return res
        .status(404)
        .json({ error: { message: "Workout log not found" } });
    res.json({ message: "Workout log deleted successfully", item: log });
  } catch (err) {
    console.error("❌ Delete Workout Log Error:", err.stack);
    res
      .status(500)
      .json({ error: { message: "Failed to delete workout log" } });
  }
};

const recordRegimentEntry = async (req, res) => {
  try {
    const { created_by, name, description, workout_structure } = req.body;

    // Optional: Validate workout_structure format here

    const regiment = await recordRegiment({
      created_by,
      name,
      description,
      workout_structure,
    });

    res.status(201).json({
      item: regiment,
      message: "Regiment recorded successfully",
    });
  } catch (err) {
    console.error("❌ Record Regiment Error:", err.stack);
    res.status(500).json({
      error: { message: "Failed to record regiment" },
    });
  }
};


const fetchAllRegimentsList = async (req, res) => {
  try {
    const regiments = await fetchAllRegiments();
    res.status(200).json({ items: regiments, count: regiments.length });
  } catch (err) {
    console.error("❌ Fetch Regiments Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch regiments" } });
  }
};


const fetchRegimentByIdEntry = async (req, res) => {
  try {
    const regiment = await fetchRegimentById(req.params.id);
    if (!regiment)
      return res.status(404).json({ error: { message: "Regiment not found" } });
    res.json({ item: regiment });
  } catch (err) {
    console.error("❌ Fetch Regiment Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch regiment" } });
  }
};

const updateRegimentByIdEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, workout_structure } = req.body;
    const regiment = await updateRegimentById(id, {
      name,
      description,
      workout_structure,
    });
    if (!regiment)
      return res.status(404).json({ error: { message: "Regiment not found" } });
    res.json({ item: regiment, message: "Regiment updated successfully" });
  } catch (err) {
    console.error("❌ Update Regiment Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to update regiment" } });
  }
};

const deleteRegimentByIdEntry = async (req, res) => {
  try {
    const regiment = await deleteRegimentById(req.params.id);
    if (!regiment)
      return res.status(404).json({ error: { message: "Regiment not found" } });
    res.json({ message: "Regiment deleted successfully", item: regiment });
  } catch (err) {
    console.error("❌ Delete Regiment Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to delete regiment" } });
  }
};

export {
  recordExerciseEntry,
  fetchAllExercisesList,
  fetchExerciseByIdEntry,
  updateExerciseByIdEntry,
  deleteExerciseByIdEntry,
  recordWorkoutEntry,
  fetchAllWorkoutsList,
  fetchWorkoutByIdEntry,
  updateWorkoutByIdEntry,
  deleteWorkoutByIdEntry,
  recordWorkoutLogEntry,
  fetchUserWorkoutLogsList,
  fetchWorkoutLogByIdEntry,
  updateWorkoutLogByIdEntry,
  deleteWorkoutLogByIdEntry,
  recordRegimentEntry,
  fetchAllRegimentsList,
  fetchRegimentByIdEntry,
  updateRegimentByIdEntry,
  deleteRegimentByIdEntry,
};
