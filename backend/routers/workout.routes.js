const router = express.Router();

// Exercise Routes
router.post('/exercises', ExercisesController.createExercise);
router.get('/exercises', ExercisesController.getAllExercises);
router.get('/exercises/:id', ExercisesController.getExerciseById);
router.put('/exercises/:id', ExercisesController.updateExercise);
router.delete('/exercises/:id', ExercisesController.deleteExercise);

// Workout Routes
router.post('/workouts', WorkoutsController.createWorkout);
router.get('/workouts', WorkoutsController.getAllWorkouts);
router.get('/workouts/:id', WorkoutsController.getWorkoutById);
router.put('/workouts/:id', WorkoutsController.updateWorkout);
router.delete('/workouts/:id', WorkoutsController.deleteWorkout);

// Workout Log Routes
router.post('/workout-logs', WorkoutLogsController.createWorkoutLog);
router.get('/workout-logs/user/:userId', WorkoutLogsController.getUserWorkoutLogs);
router.get('/workout-logs/:id', WorkoutLogsController.getWorkoutLogById);
router.put('/workout-logs/:id', WorkoutLogsController.updateWorkoutLog);
router.delete('/workout-logs/:id', WorkoutLogsController.deleteWorkoutLog);

// Regiment Routes
router.post('/regiments', RegimentsController.createRegiment);
router.get('/regiments', RegimentsController.getAllRegiments);
router.get('/regiments/:id', RegimentsController.getRegimentById);
router.put('/regiments/:id', RegimentsController.updateRegiment);
router.delete('/regiments/:id', RegimentsController.deleteRegiment);

module.exports = {
  router,
  ExercisesController,
  WorkoutsController,
  WorkoutLogsController,
  RegimentsController
};