import db from "../config/db.js";

// Insert attendance log
export const insertAttendance = async (user_id, qr_id) => {
  const query = `
    INSERT INTO attendance_logs (user_id, qr_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, qr_id) DO NOTHING
    RETURNING *;
  `;
  const result = await db.query(query, [user_id, qr_id]);
  return result.rows;
};

// Get all attendance logs
export const getAllLogs = async () => {
  const result = await db.query(`
    SELECT al.*, u.name, q.valid_for
    FROM attendance_logs al
    JOIN users u ON u.user_id = al.user_id
    JOIN daily_qr_codes q ON q.qr_id = al.qr_id
    ORDER BY al.scanned_at DESC;
  `);
  return result.rows;
};

// Get logs by user
export const getLogsByUser = async (user_id) => {
  const result = await db.query(
    `
    SELECT * FROM attendance_logs
    WHERE user_id = $1
    ORDER BY scanned_at DESC;
  `,
    [user_id],
  );
  return result.rows;
};

// Delete attendance
export const deleteLog = async (id) => {
  const result = await db.query(
    `
    DELETE FROM attendance_logs
    WHERE attendance_id = $1
    RETURNING *;
  `,
    [id],
  );
  return result.rows;
};

// Delete today's attendance log for a user by userid
export const deleteTodaysLogByUserId = async (user_id) => {
  const result = await db.query(
    `
    DELETE FROM attendance_logs al
    USING daily_qr_codes q
    WHERE al.qr_id = q.qr_id
      AND q.valid_for = CURRENT_DATE
      AND al.user_id = $1
    RETURNING al.*;
  `,
    [user_id],
  );

  return result.rows;
};

export const getTodaysLogs = async () => {
  const result = await db.query(`
    SELECT al.*, u.name, q.valid_for
    FROM attendance_logs al
    JOIN users u ON u.user_id = al.user_id
    JOIN daily_qr_codes q ON q.qr_id = al.qr_id
    WHERE q.valid_for = CURRENT_DATE
    ORDER BY al.scanned_at DESC;
  `);
  return result.rows;
};

export const getCurrentMonthLogs = async () => {
  const result = await db.query(`
    SELECT al.*, u.name, q.valid_for
    FROM attendance_logs al
    JOIN users u ON u.user_id = al.user_id
    JOIN daily_qr_codes q ON q.qr_id = al.qr_id
    WHERE DATE_TRUNC('month', q.valid_for) = DATE_TRUNC('month', CURRENT_DATE)
    ORDER BY al.scanned_at DESC;
  `);
  return result.rows;
};

export const getCurrentMonthLogsByUser = async (user_id) => {
  const result = await db.query(
    `
    SELECT al.*, u.name, q.valid_for
    FROM attendance_logs al
    JOIN users u ON u.user_id = al.user_id
    JOIN daily_qr_codes q ON q.qr_id = al.qr_id
    WHERE al.user_id = $1
      AND DATE_TRUNC('month', q.valid_for) = DATE_TRUNC('month', CURRENT_DATE)
    ORDER BY al.scanned_at DESC;
  `,
    [user_id],
  );

  return result.rows;
};
