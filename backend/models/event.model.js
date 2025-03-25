// models/eventModel.js
import db from "../config/db.js";

export const createEvent = async (
  name,
  description,
  cover_image,
  event_date,
  location,
) => {
  return db.query(
    "INSERT INTO events (name, description, cover_image, event_date, location) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, description, cover_image, event_date, location],
  );
};

export const addWorkoutTemplates = async (eventId, workoutTemplates) => {
  const insertQueries = workoutTemplates.map((template) => {
    return db.query(
      "INSERT INTO event_workouts (event_id, workout_template_id) VALUES ($1, $2)",
      [eventId, template],
    );
  });
  return Promise.all(insertQueries);
};

export const getAllEvents = async () => {
  return db.query(
    "SELECT e.*, json_agg(wt.id) AS workout_templates FROM events e LEFT JOIN event_workouts ew ON e.id = ew.event_id LEFT JOIN workout_templates wt ON ew.workout_template_id = wt.id GROUP BY e.id",
  );
};

export const getEventById = async (eventId) => {
  return db.query(
    "SELECT e.*, json_agg(wt.id) AS workout_templates FROM events e LEFT JOIN event_workouts ew ON e.id = ew.event_id LEFT JOIN workout_templates wt ON ew.workout_template_id = wt.id WHERE e.id = $1 GROUP BY e.id",
    [eventId],
  );
};

export const updateEvent = async (
  eventId,
  name,
  description,
  cover_image,
  event_date,
  location,
) => {
  return db.query(
    "UPDATE events SET name = $1, description = $2, cover_image = $3, event_date = $4, location = $5 WHERE id = $6 RETURNING *",
    [name, description, cover_image, event_date, location, eventId],
  );
};

export const deleteEventWorkouts = async (eventId) => {
  return db.query("DELETE FROM event_workouts WHERE event_id = $1", [eventId]);
};

export const getUserEvents = async (userId) => {
  return db.query(
    "SELECT e.* FROM events e JOIN event_participants ep ON e.id = ep.event_id WHERE ep.user_id = $1",
    [userId],
  );
};

export const getUserEnrolledEvents = async (userId) => {
  return db.query(
    "SELECT e.* FROM events e JOIN event_participants ep ON e.id = ep.event_id WHERE ep.user_id = $1",
    [userId],
  );
};

export const enrollUserInEvent = async (eventId, userId) => {
  return db.query(
    "INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2) RETURNING *",
    [eventId, userId],
  );
};

export const removeUserFromEvent = async (eventId, userId) => {
  return db.query(
    "DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2 RETURNING *",
    [eventId, userId],
  );
};

export const deleteEvent = async (eventId) => {
  return db.query("DELETE FROM events WHERE id = $1 RETURNING *", [eventId]);
};
