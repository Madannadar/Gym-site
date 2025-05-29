class ExercisesController {
  // Create a new exercise
  static async createExercise(req, res) {
    const { name, description, muscle_group, units, created_by } = req.body;
    
    try {
      const query = `
        INSERT INTO exercises (name, description, muscle_group, units, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await pool.query(query, [name, description, muscle_group, units, created_by]);
      
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Exercise created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating exercise',
        error: error.message
      });
    }
  }

  // Get all exercises
  static async getAllExercises(req, res) {
    try {
      const query = `
        SELECT e.*, u.username as created_by_name
        FROM exercises e
        LEFT JOIN users u ON e.created_by = u.user_id
        ORDER BY e.created_at DESC
      `;
      
      const result = await pool.query(query);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching exercises',
        error: error.message
      });
    }
  }

  // Get exercise by ID
  static async getExerciseById(req, res) {
    const { id } = req.params;
    
    try {
      const query = `
        SELECT e.*, u.username as created_by_name
        FROM exercises e
        LEFT JOIN users u ON e.created_by = u.user_id
        WHERE e.exercise_id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching exercise',
        error: error.message
      });
    }
  }

  // Update exercise
  static async updateExercise(req, res) {
    const { id } = req.params;
    const { name, description, muscle_group, units } = req.body;
    
    try {
      const query = `
        UPDATE exercises 
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            muscle_group = COALESCE($3, muscle_group),
            units = COALESCE($4, units)
        WHERE exercise_id = $5
        RETURNING *
      `;
      
      const result = await pool.query(query, [name, description, muscle_group, units, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Exercise updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating exercise',
        error: error.message
      });
    }
  }

  // Delete exercise
  static async deleteExercise(req, res) {
    const { id } = req.params;
    
    try {
      const query = 'DELETE FROM exercises WHERE exercise_id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Exercise deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting exercise',
        error: error.message
      });
    }
  }
}

// WORKOUTS CONTROLLER
class WorkoutsController {
  // Create a new workout
  static async createWorkout(req, res) {
    const { name, created_by, description, structure, score } = req.body;
    
    try {
      const query = `
        INSERT INTO workouts (name, created_by, description, structure, score)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await pool.query(query, [name, created_by, description, JSON.stringify(structure), score]);
      
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Workout created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating workout',
        error: error.message
      });
    }
  }

  // Get all workouts
  static async getAllWorkouts(req, res) {
    try {
      const query = `
        SELECT w.*, u.username as created_by_name
        FROM workouts w
        LEFT JOIN users u ON w.created_by = u.user_id
        ORDER BY w.created_at DESC
      `;
      
      const result = await pool.query(query);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching workouts',
        error: error.message
      });
    }
  }

  // Get workout by ID with exercise details
  static async getWorkoutById(req, res) {
    const { id } = req.params;
    
    try {
      const workoutQuery = `
        SELECT w.*, u.username as created_by_name
        FROM workouts w
        LEFT JOIN users u ON w.created_by = u.user_id
        WHERE w.workout_id = $1
      `;
      
      const workoutResult = await pool.query(workoutQuery, [id]);
      
      if (workoutResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }

      // Get exercise details for the workout structure
      const workout = workoutResult.rows[0];
      const exerciseIds = workout.structure.map(item => item.exercise_id);
      
      if (exerciseIds.length > 0) {
        const exercisesQuery = `
          SELECT exercise_id, name, description, muscle_group, units
          FROM exercises
          WHERE exercise_id = ANY($1)
        `;
        
        const exercisesResult = await pool.query(exercisesQuery, [exerciseIds]);
        const exercisesMap = exercisesResult.rows.reduce((acc, exercise) => {
          acc[exercise.exercise_id] = exercise;
          return acc;
        }, {});

        // Enrich workout structure with exercise details
        workout.structure = workout.structure.map(item => ({
          ...item,
          exercise_details: exercisesMap[item.exercise_id] || null
        }));
      }
      
      res.status(200).json({
        success: true,
        data: workout
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching workout',
        error: error.message
      });
    }
  }

  // Update workout
  static async updateWorkout(req, res) {
    const { id } = req.params;
    const { name, description, structure, score } = req.body;
    
    try {
      const query = `
        UPDATE workouts 
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            structure = COALESCE($3, structure),
            score = COALESCE($4, score)
        WHERE workout_id = $5
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        name, 
        description, 
        structure ? JSON.stringify(structure) : null, 
        score, 
        id
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Workout updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating workout',
        error: error.message
      });
    }
  }

  // Delete workout
  static async deleteWorkout(req, res) {
    const { id } = req.params;
    
    try {
      const query = 'DELETE FROM workouts WHERE workout_id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Workout deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting workout',
        error: error.message
      });
    }
  }
}

// WORKOUT LOGS CONTROLLER
class WorkoutLogsController {
  // Create a new workout log
  static async createWorkoutLog(req, res) {
    const { user_id, regiment_id, regiment_day_index, log_date, planned_workout_id, actual_workout, score } = req.body;
    
    try {
      const query = `
        INSERT INTO workout_logs (user_id, regiment_id, regiment_day_index, log_date, planned_workout_id, actual_workout, score)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        user_id, 
        regiment_id, 
        regiment_day_index, 
        log_date, 
        planned_workout_id, 
        JSON.stringify(actual_workout), 
        score || 0
      ]);
      
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Workout log created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating workout log',
        error: error.message
      });
    }
  }

  // Get all workout logs for a user
  static async getUserWorkoutLogs(req, res) {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    try {
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
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching workout logs',
        error: error.message
      });
    }
  }

  // Get workout log by ID
  static async getWorkoutLogById(req, res) {
    const { id } = req.params;
    
    try {
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
        WHERE wl.workout_log_id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workout log not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching workout log',
        error: error.message
      });
    }
  }

  // Update workout log
  static async updateWorkoutLog(req, res) {
    const { id } = req.params;
    const { actual_workout, score } = req.body;
    
    try {
      const query = `
        UPDATE workout_logs 
        SET actual_workout = COALESCE($1, actual_workout),
            score = COALESCE($2, score)
        WHERE workout_log_id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        actual_workout ? JSON.stringify(actual_workout) : null,
        score,
        id
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workout log not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Workout log updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating workout log',
        error: error.message
      });
    }
  }

  // Delete workout log
  static async deleteWorkoutLog(req, res) {
    const { id } = req.params;
    
    try {
      const query = 'DELETE FROM workout_logs WHERE workout_log_id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workout log not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Workout log deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting workout log',
        error: error.message
      });
    }
  }
}

// REGIMENTS CONTROLLER
class RegimentsController {
  // Create a new regiment
  static async createRegiment(req, res) {
    const { created_by, name, description, workout_structure } = req.body;
    
    try {
      const query = `
        INSERT INTO regiments (created_by, name, description, workout_structure)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        created_by, 
        name, 
        description, 
        JSON.stringify(workout_structure)
      ]);
      
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Regiment created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating regiment',
        error: error.message
      });
    }
  }

  // Get all regiments
  static async getAllRegiments(req, res) {
    try {
      const query = `
        SELECT r.*, u.username as created_by_name
        FROM regiments r
        LEFT JOIN users u ON r.created_by = u.user_id
        ORDER BY r.created_at DESC
      `;
      
      const result = await pool.query(query);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching regiments',
        error: error.message
      });
    }
  }

  // Get regiment by ID with workout details
  static async getRegimentById(req, res) {
    const { id } = req.params;
    
    try {
      const regimentQuery = `
        SELECT r.*, u.username as created_by_name
        FROM regiments r
        LEFT JOIN users u ON r.created_by = u.user_id
        WHERE r.regiment_id = $1
      `;
      
      const regimentResult = await pool.query(regimentQuery, [id]);
      
      if (regimentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Regiment not found'
        });
      }

      // Get workout details for the regiment structure
      const regiment = regimentResult.rows[0];
      const workoutIds = regiment.workout_structure.map(day => day.workout_id);
      
      if (workoutIds.length > 0) {
        const workoutsQuery = `
          SELECT workout_id, name, description, structure, score
          FROM workouts
          WHERE workout_id = ANY($1)
        `;
        
        const workoutsResult = await pool.query(workoutsQuery, [workoutIds]);
        const workoutsMap = workoutsResult.rows.reduce((acc, workout) => {
          acc[workout.workout_id] = workout;
          return acc;
        }, {});

        // Enrich regiment structure with workout details
        regiment.workout_structure = regiment.workout_structure.map(day => ({
          ...day,
          workout_details: workoutsMap[day.workout_id] || null
        }));
      }
      
      res.status(200).json({
        success: true,
        data: regiment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching regiment',
        error: error.message
      });
    }
  }

  // Update regiment
  static async updateRegiment(req, res) {
    const { id } = req.params;
    const { name, description, workout_structure } = req.body;
    
    try {
      const query = `
        UPDATE regiments 
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            workout_structure = COALESCE($3, workout_structure)
        WHERE regiment_id = $4
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        name, 
        description, 
        workout_structure ? JSON.stringify(workout_structure) : null, 
        id
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Regiment not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Regiment updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating regiment',
        error: error.message
      });
    }
  }

  // Delete regiment
  static async deleteRegiment(req, res) {
    const { id } = req.params;
    
    try {
      const query = 'DELETE FROM regiments WHERE regiment_id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Regiment not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Regiment deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting regiment',
        error: error.message
      });
    }
  }
}