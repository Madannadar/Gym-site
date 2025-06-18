// import { pool } from "../Db/db.js";

// // Create a new regiment
// const createRegiment = async ({ name, description, createdBy, workoutStructure }) => {
//   const query = `
//     INSERT INTO regiments (name, description, created_by, workout_structure)
//     VALUES ($1, $2, $3, $4)
//     RETURNING *;
//   `;
//   const { rows } = await pool.query(query, [name, description, createdBy, workoutStructure]);
//   return rows[0];
// };

// // Create a new workout with structure
// const createWorkout = async ({ name, description, structure, createdBy }) => {
//   const query = `
//     INSERT INTO workouts (name, description, structure, created_by)
//     VALUES ($1, $2, $3, $4)
//     RETURNING *;
//   `;
//   const { rows } = await pool.query(query, [name, description, structure, createdBy]);
//   return rows[0];
// };

// // Add a new exercise
// const createExercise = async ({ name, description, muscleGroup, units, createdBy }) => {
//   const query = `
//     INSERT INTO exercises (name, description, muscle_group, units, created_by)
//     VALUES ($1, $2, $3, $4, $5)
//     RETURNING *;
//   `;
//   const { rows } = await pool.query(query, [name, description, muscleGroup, units, createdBy]);
//   return rows[0];
// };

// // Get all regiments with nested structure
// const getAllRegiments = async () => {
//   const query = `
//     SELECT 
//       r.regiment_id, r.name AS regiment_name, r.description AS regiment_description,
//       r.workout_structure, r.created_at AS regiment_created_at,
//       w.workout_id, w.name AS workout_name, w.structure, w.description AS workout_description,
//       w.created_at AS workout_created_at
//     FROM regiments r
//     LEFT JOIN LATERAL (
//       SELECT jsonb_agg(w.*) AS workouts
//       FROM jsonb_to_recordset(r.workout_structure) AS x(name TEXT, workout_id INT)
//       JOIN workouts w ON w.workout_id = x.workout_id
//     ) AS joined_workouts ON TRUE
//     LEFT JOIN workouts w ON w.workout_id = (r.workout_structure->0->>'workout_id')::INT
//     ORDER BY r.regiment_id;
//   `;
//   const { rows } = await pool.query(query);
//   return rows;
// };

// export {
//   createRegiment,
//   createWorkout,
//   createExercise,
//   getAllRegiments
// };
