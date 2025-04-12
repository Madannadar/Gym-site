import {
  createRegiment,
  createWorkout,
  createExercise,
  getAllRegiments,
} from '../models/regiment.model.js';

// Create a new regiment
export const createRegimentController = async (req, res) => {
  try {
    const { name, description, createdBy, days, workoutStructure } = req.body;

    if (!name || !createdBy || !days || !Array.isArray(workoutStructure)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (workoutStructure.length !== days) {
      return res.status(400).json({ error: `Workout structure must have ${days} entries` });
    }

    const regiment = await createRegiment({
      name,
      description,
      createdBy,
      workoutStructure,
    });

    res.status(201).json(regiment);
  } catch (err) {
    console.error("Error creating regiment:", err);
    res.status(500).json({ error: "Failed to create regiment" });
  }
};


// Create a new workout
export const createWorkoutController = async (req, res) => {
  try {
    const { name, description, createdBy, structure } = req.body;

    if (!name || !createdBy || !Array.isArray(structure)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch units for each exercise_id
    const updatedStructure = await Promise.all(
      structure.map(async (item) => {
        const { exercise_id, sets } = item;
        const result = await pool.query(
          'SELECT units FROM exercises WHERE exercise_id = $1',
          [exercise_id]
        );

        if (result.rowCount === 0) {
          throw new Error(`Exercise with ID ${exercise_id} not found`);
        }

        return {
          exercise_id,
          sets,
          units: result.rows[0].units, // assuming "units" is stored as text[]
        };
      })
    );

    // Store the workout
    const query = `
      INSERT INTO workouts (name, description, created_by, structure)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      name,
      description,
      createdBy,
      updatedStructure,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating workout:', err.message);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};


// Create a new exercise
export const createExerciseController = async (req, res) => {
  try {
    const { name, description, muscleGroup, units, createdBy } = req.body;
    const exercise = await createExercise({ name, description, muscleGroup, units, createdBy });
    res.status(201).json(exercise);
  } catch (err) {
    console.error("Error creating exercise:", err);
    res.status(500).json({ error: "Failed to create exercise" });
  }
};

// Get all regiments
export const getAllRegimentsController = async (req, res) => {
  try {
    const regiments = await getAllRegiments();
    res.status(200).json(regiments);
  } catch (err) {
    console.error("Error fetching regiments:", err);
    res.status(500).json({ error: "Failed to get regiments" });
  }
};
