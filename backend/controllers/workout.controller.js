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
} from "../model/workout.model.js"
import logger from "../utils/logger.js"

const recordExerciseEntry = async (req, res) => {
  try {
    const { name, description, muscle_group, units, created_by } = req.body;

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

    const intensity = intensityLookup[name] || 1;

    const exercise = await recordExercise({
      name,
      description,
      muscle_group,
      units,
      created_by,
      intensity,
    });

    logger.info("Exercise recorded successfully", {
      exerciseId: exercise.id,
      name,
      createdBy: created_by,
      operation: "recordExercise"
    });

    res.status(200).json({
      item: exercise,
      message: "Exercise recorded successfully",
    });
  } catch (err) {
    logger.error("Record Exercise Error", {
      error: err.message,
      stack: err.stack,
      operation: "recordExercise",
      requestBody: req.body,
      timestamp_unix: Date.now(),
    });
    
    if (err.message.includes("already present")) {
      return res.status(400).json({ error: { message: err.message } });
    }
    res.status(500).json({ error: { message: "Failed to record exercise" } });
  }
};

const fetchAllExercisesList = async (req, res) => {
  try {
    const exercises = await fetchAllExercises();
    
    logger.info("Exercises fetched successfully", {
      count: exercises.length,
      operation: "fetchAllExercises"
    });
    
    res.json({ items: exercises, count: exercises.length });
  } catch (err) {
    logger.error("Fetch Exercises Error", {
      error: err.message,
      stack: err.stack,
      operation: "fetchAllExercises"
    });
    res.status(500).json({ error: { message: "Failed to fetch exercises" } });
  }
};

const fetchExerciseByIdEntry = async (req, res) => {
  try {
    const exercise = await fetchExerciseById(req.params.id);
    if (!exercise) {
      logger.warn("Exercise not found", {
        exerciseId: req.params.id,
        operation: "fetchExerciseById"
      });
      return res.status(404).json({ error: { message: "Exercise not found" } });
    }
    
    logger.info("Exercise fetched successfully", {
      exerciseId: req.params.id,
      operation: "fetchExerciseById"
    });
    
    res.json({ item: exercise });
  } catch (err) {
    logger.error("Fetch Exercise Error", {
      error: err.message,
      stack: err.stack,
      exerciseId: req.params.id,
      operation: "fetchExerciseById"
    });
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
    if (!exercise) {
      logger.warn("Exercise not found for update", {
        exerciseId: id,
        operation: "updateExerciseById"
      });
      return res.status(404).json({ error: { message: "Exercise not found" } });
    }
    
    logger.info("Exercise updated successfully", {
      exerciseId: id,
      updatedFields: { name, description, muscle_group, units },
      operation: "updateExerciseById"
    });
    
    res.json({ item: exercise, message: "Exercise updated successfully" });
  } catch (err) {
    logger.error("Update Exercise Error", {
      error: err.message,
      stack: err.stack,
      exerciseId: req.params.id,
      requestBody: req.body,
      operation: "updateExerciseById"
    });
    
    if (err.message.includes("already present")) {
      return res.status(400).json({ error: { message: err.message } });
    }
    res.status(500).json({ error: { message: "Failed to update exercise" } });
  }
};

const deleteExerciseByIdEntry = async (req, res) => {
  try {
    const exercise = await deleteExerciseById(req.params.id);
    if (!exercise) {
      logger.warn("Exercise not found for deletion", {
        exerciseId: req.params.id,
        operation: "deleteExerciseById"
      });
      return res.status(404).json({ error: { message: "Exercise not found" } });
    }
    
    logger.info("Exercise deleted successfully", {
      exerciseId: req.params.id,
      deletedExercise: exercise.name,
      operation: "deleteExerciseById"
    });
    
    res.json({ message: "Exercise deleted successfully", item: exercise });
  } catch (err) {
    logger.error("Delete Exercise Error", {
      error: err.message,
      stack: err.stack,
      exerciseId: req.params.id,
      operation: "deleteExerciseById"
    });
    res.status(500).json({ error: { message: "Failed to delete exercise" } });
  }
};

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

    if (item.weight_unit && !['kg', 'lbs'].includes(item.weight_unit)) {
      return false;
    }

    if (item.time_unit && !['seconds', 'minutes'].includes(item.time_unit)) {
      return false;
    }
  }

  return true;
};

const recordWorkoutEntry = async (req, res) => {
  try {
    const { name, created_by, description, structure } = req.body;

    if (!validateWorkoutStructure(structure)) {
      logger.warn("Invalid workout structure provided", {
        structure,
        operation: "recordWorkout"
      });
      return res.status(400).json({
        error: {
          message: 'Invalid structure format. Please ensure it follows the schema rules.',
        },
      });
    }

    const workout = await recordWorkout({
      name,
      created_by,
      description,
      structure,
    });

    const exerciseIds = structure.map(item => item.exercise_id);

    logger.info("Workout recorded successfully", {
      workoutId: workout.id,
      name,
      createdBy: created_by,
      exerciseIds,
      operation: "recordWorkout"
    });

    res.status(201).json({
      item: workout,
      exercise_ids: exerciseIds,
      message: 'Workout recorded successfully',
    });
  } catch (err) {
    logger.error("Record Workout Error", {
      error: err.message,
      stack: err.stack,
      requestBody: req.body,
      operation: "recordWorkout"
    });
    
    if (err.message.includes("already present")) {
      return res.status(400).json({ error: { message: err.message } });
    }
    if (err.message.startsWith('Invalid exercise_id')) {
      return res.status(400).json({ error: { message: err.message } });
    }
    res.status(500).json({ error: { message: 'Failed to record workout' } });
  }
};

const fetchAllWorkoutsList = async (req, res) => {
  try {
    const workouts = await fetchAllWorkouts();
    
    logger.info("Workouts fetched successfully", {
      count: workouts.length,
      operation: "fetchAllWorkouts"
    });
    
    res.json({
      items: workouts.map(workout => ({
        ...workout,
        intensity: undefined  // explicitly remove intensity if still present
      })),
      count: workouts.length
    });
  } catch (err) {
    logger.error("Fetch Workouts Error", {
      error: err.message,
      stack: err.stack,
      operation: "fetchAllWorkouts"
    });
    res.status(500).json({ error: { message: "Failed to fetch workouts" } });
  }
};

const fetchWorkoutByIdEntry = async (req, res) => {
  try {
    const workout = await fetchWorkoutById(req.params.id);
    if (!workout) {
      logger.warn("Workout not found", {
        workoutId: req.params.id,
        operation: "fetchWorkoutById"
      });
      return res.status(404).json({ error: { message: "Workout not found" } });
    }
    // remove intensity if present
    delete workout.intensity;

    logger.info("Workout fetched successfully", {
      workoutId: req.params.id,
      operation: "fetchWorkoutById"
    });

    res.json({ item: workout });
  } catch (err) {
    logger.error("Fetch Workout Error", {
      error: err.message,
      stack: err.stack,
      workoutId: req.params.id,
      operation: "fetchWorkoutById"
    });
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
      score,  // score is fully calculated already before calling update
    });

    if (!workout) {
      logger.warn("Workout not found for update", {
        workoutId: id,
        operation: "updateWorkoutById"
      });
      return res.status(404).json({ error: { message: "Workout not found" } });
    }

    delete workout.intensity;
    
    logger.info("Workout updated successfully", {
      workoutId: id,
      updatedFields: { name, description, score },
      operation: "updateWorkoutById"
    });
    
    res.json({ item: workout, message: "Workout updated successfully" });
  } catch (err) {
    logger.error("Update Workout Error", {
      error: err.message,
      stack: err.stack,
      workoutId: req.params.id,
      requestBody: req.body,
      operation: "updateWorkoutById"
    });
    
    if (err.message.includes("already present")) {
      return res.status(400).json({ error: { message: err.message } });
    }
    res.status(500).json({ error: { message: "Failed to update workout" } });
  }
};

const deleteWorkoutByIdEntry = async (req, res) => {
  try {
    const workout = await deleteWorkoutById(req.params.id);
    if (!workout) {
      logger.warn("Workout not found for deletion", {
        workoutId: req.params.id,
        operation: "deleteWorkoutById"
      });
      return res.status(404).json({ error: { message: "Workout not found" } });
    }
    
    logger.info("Workout deleted successfully", {
      workoutId: req.params.id,
      deletedWorkout: workout.name,
      operation: "deleteWorkoutById"
    });
    
    res.json({ message: "Workout deleted successfully", item: workout });
  } catch (err) {
    logger.error("Delete Workout Error", {
      error: err.message,
      stack: err.stack,
      workoutId: req.params.id,
      operation: "deleteWorkoutById"
    });
    res.status(500).json({ error: { message: "Failed to delete workout" } });
  }
};

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
      actual_workout
    } = req.body;

    // Validate structure
    if (!validateActualWorkout(actual_workout)) {
      logger.warn("Invalid actual workout structure provided", {
        userId: user_id,
        regimentId: regiment_id,
        operation: "recordWorkoutLog"
      });
      return res.status(400).json({ error: { message: "Invalid actual_workout structure" } });
    }

    // Call backend function that will handle score calculation internally
    const log = await recordWorkoutLog({
      user_id,
      regiment_id,
      regiment_day_index,
      log_date,
      planned_workout_id,
      actual_workout
    });

    logger.info("Workout log recorded successfully", {
      logId: log.id,
      userId: user_id,
      regimentId: regiment_id,
      plannedWorkoutId: planned_workout_id,
      operation: "recordWorkoutLog"
    });

    res.status(201).json({ item: log, message: "Workout log recorded successfully" });

  } catch (err) {
    logger.error("Record Workout Log Error", {
      error: err.message,
      stack: err.stack,
      requestBody: req.body,
      operation: "recordWorkoutLog"
    });
    res.status(500).json({ error: { message: err.message || "Failed to record workout log" } });
  }
};

const fetchUserWorkoutLogsList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const logs = await fetchUserWorkoutLogs(userId, limit, offset);
    
    logger.info("User workout logs fetched successfully", {
      userId,
      count: logs.length,
      limit,
      offset,
      operation: "fetchUserWorkoutLogs"
    });
    
    res.json({ items: logs, count: logs.length });
  } catch (err) {
    logger.error("Fetch Workout Logs Error", {
      error: err.message,
      stack: err.stack,
      userId: req.params.userId,
      query: req.query,
      operation: "fetchUserWorkoutLogs"
    });
    res.status(500).json({ error: { message: "Failed to fetch workout logs" } });
  }
};

const fetchWorkoutLogByIdEntry = async (req, res) => {
  try {
    const log = await fetchWorkoutLogById(req.params.id);
    if (!log) {
      logger.warn("Workout log not found", {
        logId: req.params.id,
        operation: "fetchWorkoutLogById"
      });
      return res.status(404).json({ error: { message: "Workout log not found" } });
    }
    
    logger.info("Workout log fetched successfully", {
      logId: req.params.id,
      operation: "fetchWorkoutLogById"
    });
    
    res.json({ item: log });
  } catch (err) {
    logger.error("Fetch Workout Log Error", {
      error: err.message,
      stack: err.stack,
      logId: req.params.id,
      operation: "fetchWorkoutLogById"
    });
    res.status(500).json({ error: { message: "Failed to fetch workout log" } });
  }
};

const updateWorkoutLogByIdEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_workout, score } = req.body;
    const log = await updateWorkoutLogById(id, { actual_workout, score });
    if (!log) {
      logger.warn("Workout log not found for update", {
        logId: id,
        operation: "updateWorkoutLogById"
      });
      return res.status(404).json({ error: { message: "Workout log not found" } });
    }
    
    logger.info("Workout log updated successfully", {
      logId: id,
      operation: "updateWorkoutLogById"
    });
    
    res.json({ item: log, message: "Workout log updated successfully" });
  } catch (err) {
    logger.error("Update Workout Log Error", {
      error: err.message,
      stack: err.stack,
      logId: req.params.id,
      requestBody: req.body,
      operation: "updateWorkoutLogById"
    });
    res.status(500).json({ error: { message: "Failed to update workout log" } });
  }
};

const deleteWorkoutLogByIdEntry = async (req, res) => {
  try {
    const log = await deleteWorkoutLogById(req.params.id);
    if (!log) {
      logger.warn("Workout log not found for deletion", {
        logId: req.params.id,
        operation: "deleteWorkoutLogById"
      });
      return res.status(404).json({ error: { message: "Workout log not found" } });
    }
    
    logger.info("Workout log deleted successfully", {
      logId: req.params.id,
      operation: "deleteWorkoutLogById"
    });
    
    res.json({ message: "Workout log deleted successfully", item: log });
  } catch (err) {
    logger.error("Delete Workout Log Error", {
      error: err.message,
      stack: err.stack,
      logId: req.params.id,
      operation: "deleteWorkoutLogById"
    });
    res.status(500).json({ error: { message: "Failed to delete workout log" } });
  }
};

const recordRegimentEntry = async (req, res) => {
  try {
    const { created_by, name, description, workout_structure } = req.body;

    // Basic validation
    if (!created_by || !name || !workout_structure || !Array.isArray(workout_structure)) {
      logger.warn("Invalid regiment data provided", {
        createdBy: created_by,
        name,
        hasWorkoutStructure: !!workout_structure,
        isWorkoutStructureArray: Array.isArray(workout_structure),
        operation: "recordRegiment"
      });
      return res.status(400).json({
        error: { message: "Missing required fields or invalid workout_structure format." }
      });
    }

    const regiment = await recordRegiment({
      created_by,
      name,
      description,
      workout_structure,
    });

    logger.info("Regiment recorded successfully", {
      regimentId: regiment.id,
      name,
      createdBy: created_by,
      workoutCount: workout_structure.length,
      operation: "recordRegiment"
    });

    res.status(201).json({
      item: regiment,
      message: "Regiment recorded successfully",
    });

  } catch (err) {
    logger.error("Record Regiment Error", {
      error: err.message,
      stack: err.stack,
      requestBody: req.body,
      operation: "recordRegiment"
    });
    
    if (err.message.includes("already present")) {
      return res.status(400).json({ error: { message: err.message } });
    }

    if (err.message.startsWith("Workout ID(s) not found")) {
      return res.status(400).json({ error: { message: err.message } });
    }

    if (err.message.startsWith("User with id")) {
      return res.status(400).json({ error: { message: err.message } });
    }

    res.status(500).json({ error: { message: "Failed to record regiment" } });
  }
};

const fetchAllRegimentsList = async (req, res) => {
  try {
    const regiments = await fetchAllRegiments();
    
    logger.info("Regiments fetched successfully", {
      count: regiments.length,
      operation: "fetchAllRegiments"
    });
    
    res.status(200).json({ items: regiments, count: regiments.length });
  } catch (err) {
    logger.error("Fetch Regiments Error", {
      error: err.message,
      stack: err.stack,
      operation: "fetchAllRegiments"
    });
    res.status(500).json({ error: { message: "Failed to fetch regiments" } });
  }
};

const fetchRegimentByIdEntry = async (req, res) => {
  try {
    const regiment = await fetchRegimentById(req.params.id);
    if (!regiment) {
      logger.warn("Regiment not found", {
        regimentId: req.params.id,
        operation: "fetchRegimentById"
      });
      return res.status(404).json({ error: { message: "Regiment not found" } });
    }
    
    logger.info("Regiment fetched successfully", {
      regimentId: req.params.id,
      operation: "fetchRegimentById"
    });
    
    res.json({ item: regiment });
  } catch (err) {
    logger.error("Fetch Regiment Error", {
      error: err.message,
      stack: err.stack,
      regimentId: req.params.id,
      operation: "fetchRegimentById"
    });
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
    if (!regiment) {
      logger.warn("Regiment not found for update", {
        regimentId: id,
        operation: "updateRegimentById"
      });
      return res.status(404).json({ error: { message: "Regiment not found" } });
    }
    
    logger.info("Regiment updated successfully", {
      regimentId: id,
      updatedFields: { name, description },
      workoutCount: workout_structure?.length,
      operation: "updateRegimentById"
    });
    
    res.json({ item: regiment, message: "Regiment updated successfully" });
  } catch (err) {
    logger.error("Update Regiment Error", {
      error: err.message,
      stack: err.stack,
      regimentId: req.params.id,
      requestBody: req.body,
      operation: "updateRegimentById"
    });
    
    if (err.message.includes("already present")) {
      return res.status(400).json({ error: { message: err.message } });
    }
    res.status(500).json({ error: { message: "Failed to update regiment" } });
  }
};

const deleteRegimentByIdEntry = async (req, res) => {
  try {
    const regiment = await deleteRegimentById(req.params.id);
    if (!regiment) {
      logger.warn("Regiment not found for deletion", {
        regimentId: req.params.id,
        operation: "deleteRegimentById"
      });
      return res.status(404).json({ error: { message: "Regiment not found" } });
    }
    
    logger.info("Regiment deleted successfully", {
      regimentId: req.params.id,
      deletedRegiment: regiment.name,
      operation: "deleteRegimentById"
    });
    
    res.json({ message: "Regiment deleted successfully", item: regiment });
  } catch (err) {
    logger.error("Delete Regiment Error", {
      error: err.message,
      stack: err.stack,
      regimentId: req.params.id,
      operation: "deleteRegimentById"
    });
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