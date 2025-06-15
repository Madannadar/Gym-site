import db from "../config/db.js";

export const createHealthLog = async ({
  user_id,
  log_type,
  value, // keeping for backward compatibility
  height,
  weight,
  log_date,
}) => {
  const query = `
    INSERT INTO user_health_logs (user_id, log_type, value, height, weight, log_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    user_id, 
    log_type, 
    value,
    height,
    weight,
    log_date
  ]);
  return rows[0];
};

export const getRecentHealthLogs = async (user_id, log_type, limit = 5) => {
  const query = `
    SELECT * FROM user_health_logs
    WHERE user_id = $1 ${log_type ? 'AND log_type = $2' : ''}
    ORDER BY log_date DESC
    LIMIT ${log_type ? '$3' : '$2'};
  `;
  const params = log_type ? [user_id, log_type, limit] : [user_id, limit];
  const { rows } = await db.query(query, params);
  return rows;
};

export const updateHealthLog = async (log_id, user_id, value, height, weight, log_date) => {
  const query = `
    UPDATE user_health_logs
    SET 
      value = COALESCE($1, value),
      height = COALESCE($2, height),
      weight = COALESCE($3, weight),
      log_date = $4
    WHERE log_id = $5 AND user_id = $6
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    value,
    height,
    weight,
    log_date,
    log_id,
    user_id
  ]);
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
