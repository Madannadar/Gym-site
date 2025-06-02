import db from "../config/db.js";

// Event Templates
export const createEvent = async (data) => {
  const {
    created_by,
    name,
    description,
    regiment_id,
    event_date,
    event_time,
    event_location,
    number_of_participants,
  } = data;

  const query = `
    INSERT INTO event_templates
    (created_by, name, description, regiment_id, event_date, event_time, event_location, number_of_participants)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    created_by,
    name,
    description,
    regiment_id,
    event_date,
    event_time,
    event_location,
    number_of_participants,
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getAllEvents = async () => {
  const { rows } = await db.query(
    "SELECT * FROM event_templates ORDER BY event_date DESC;",
  );
  return rows;
};

export const getEventById = async (id) => {
  const { rows } = await db.query(
    "SELECT * FROM event_templates WHERE event_id = $1;",
    [id],
  );
  return rows[0];
};

// Event Logs
export const logEventParticipation = async (data) => {
  const {
    event_id,
    user_id,
    regiment_id,
    workout_template_values,
    user_score,
  } = data;

  const query = `
    INSERT INTO event_logs (event_id, user_id, regiment_id, workout_template_values, user_score)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    event_id,
    user_id,
    regiment_id,
    workout_template_values,
    user_score,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getEventLogsByEventId = async (event_id) => {
  const { rows } = await db.query(
    `SELECT * FROM event_logs WHERE event_id = $1 ORDER BY created_at DESC;`,
    [event_id],
  );
  return rows;
};

export const getEventLogsByUserId = async (user_id) => {
  const { rows } = await db.query(
    `SELECT * FROM event_logs WHERE user_id = $1 ORDER BY created_at DESC;`,
    [user_id],
  );
  return rows;
};
