import db from "../config/db.js";

export const getAllTemplates = async () => {
  const { rows } = await db.query("SELECT * FROM workout_templates");
  return rows;
};

export const getTemplateById = async (id) => {
  const { rows } = await db.query(
    "SELECT * FROM workout_templates WHERE id = $1",
    [id],
  );
  if (rows.length === 0) return null;

  // Fetch exercises linked to this template
  const exercises = await db.query(
    "SELECT e.* FROM workout_exercises we JOIN exercises e ON we.exercise_id = e.id WHERE we.workout_template_id = $1",
    [id],
  );

  return { ...rows[0], exercises: exercises.rows };
};

export const createOrUpdateTemplate = async ({
  id,
  name,
  description,
  cover_image,
  difficulty,
  duration,
  exercises,
}) => {
  let template;
  if (id) {
    // Update existing template
    const { rows } = await db.query(
      "UPDATE workout_templates SET name = $1, description = $2, cover_image = $3, difficulty = $4, duration = $5 WHERE id = $6 RETURNING *",
      [name, description, cover_image, difficulty, duration, id],
    );
    template = rows[0];
  } else {
    // Create a new template
    const { rows } = await db.query(
      "INSERT INTO workout_templates (name, description, cover_image, difficulty, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, cover_image, difficulty, duration],
    );
    template = rows[0];
    id = template.id; // Set new ID
  }

  if (exercises && exercises.length > 0) {
    // Remove existing exercises
    await db.query(
      "DELETE FROM workout_exercises WHERE workout_template_id = $1",
      [id],
    );

    // Add new exercises
    for (const exercise of exercises) {
      await db.query(
        "INSERT INTO workout_exercises (workout_template_id, exercise_id, reps, units) VALUES ($1, $2, $3, $4)",
        [id, exercise.exercise_id, exercise.reps, exercise.units],
      );
    }
  }

  return getTemplateById(id);
};

export const deleteTemplate = async (id) => {
  await db.query(
    "DELETE FROM workout_exercises WHERE workout_template_id = $1",
    [id],
  ); // Remove related exercises first
  await db.query("DELETE FROM workout_templates WHERE id = $1", [id]);
};
