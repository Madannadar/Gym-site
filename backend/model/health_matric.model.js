import db from "../config/db.js";

export const createHealthLog = async ({
  user_id,
  log_type,
  value,
  log_date,
}) => {
  const query = `
    INSERT INTO user_health_logs (user_id, log_type, value, log_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [user_id, log_type, value, log_date]);
  return rows[0];
};

export const getRecentHealthLogs = async (user_id, log_type, limit = 5) => {
  const query = `
    SELECT * FROM user_health_logs
    WHERE user_id = $1 AND log_type = $2
    ORDER BY log_date DESC
    LIMIT $3;
  `;
  const { rows } = await db.query(query, [user_id, log_type, limit]);
  return rows;
};

export const updateHealthLog = async (log_id, user_id, value, log_date) => {
  const query = `
    UPDATE user_health_logs
    SET value = $1, log_date = $2
    WHERE log_id = $3 AND user_id = $4
    RETURNING *;
  `;
  const { rows } = await db.query(query, [value, log_date, log_id, user_id]);
  return rows[0];
};

export const deleteHealthLog = async (log_id, user_id) => {
  const query = `
    DELETE FROM user_health_logs
    WHERE log_id = $1 AND user_id = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [log_id, user_id]);
  return rows[0];
};

export const getHealthLogById = async (log_id, user_id) => {
  const query = `
    SELECT * FROM user_health_logs
    WHERE log_id = $1 AND user_id = $2;
  `;
  const { rows } = await db.query(query, [log_id, user_id]);
  return rows[0];
};
