import db from "../config/db";

const recordWorkout = async ({ name, created_by, description, structure }) => {
    const duplicateCheckQuery = `
    select 1 from workouts where name = $1 And created_by = $2 limit 1`;
    const duplicateCheck = await db.query(duplicateCheckQuery, 
        [
            name, 
            created_by
        ]
    )
    if( duplicateCheck.rowCount > 0){
        throw new Error(" Workout already present")
    }

    const exerciseIds = structure.map(item => item.exercise_id)
    const checkQuery = `
    select exercise_id, name
    from exercises
    where exercise_id = any($1)
    `;
    const {rows: existingExercises} = await db.query(checkQuery, [exerciseIds])
}


const fetchWorkoutById = async (id) => {
    const workoutQuery = `
    SELECT w.*, u.first_name AS created_by_name
    FROM workouts w
    LEFT JOIN users u ON w.created_by = u.id
    WHERE w.workout_id = $1
    `;
    const workoutResult = await db.query(workoutQuery, [id]);
    if(workoutResult.rows.length === 0) return null
    const workout = workoutResult.rows[0];
    const structure = workout.structure;

    const exerciseIds = Array.isArray(structure)
    ? structure.map(item => item.exercise_id).filter(Boolean)
    : [];

    if(exerciseIds.length > 0){
        
    }
}