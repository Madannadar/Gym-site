import db from "../config/db.js";
import crypto from "crypto";

const recordAttendance = async (user_id, qr_id) => {
  const query = `
    INSERT INTO attendance_logs (user_id, qr_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, qr_id) DO NOTHING
    RETURNING *;
  `;
  const result = await db.query(query, [user_id, qr_id]);
  return result.rows;
};

const fetchAllAttendanceLogs = async () => {
  const result = await db.query(`
    SELECT al.*, u.name, q.valid_for
    FROM attendance_logs al
    JOIN users u ON u.user_id = al.user_id
    JOIN daily_qr_codes q ON q.qr_id = al.qr_id
    ORDER BY al.scanned_at DESC;
  `);
  return result.rows;
};

const fetchUserAttendanceLogs = async (user_id) => {
  const result = await db.query(
    `
    SELECT * FROM attendance_logs
    WHERE user_id = $1
    ORDER BY scanned_at DESC;
  `,
    [user_id]
  );
  return result.rows;
};

const removeAttendanceLog = async (id) => {
  const result = await db.query(
    `
    DELETE FROM attendance_logs
    WHERE attendance_id = $1
    RETURNING *;
  `,
    [id]
  );
  return result.rows;
};

const removeUserTodayAttendance = async (user_id) => {
  const result = await db.query(
    `
    DELETE FROM attendance_logs al
    USING daily_qr_codes q
    WHERE al.qr_id = q.qr_id
      AND q.valid_for = CURRENT_DATE
      AND al.user_id = $1
    RETURNING al.*;
  `,
    [user_id]
  );
  return result.rows;
};

const fetchTodayAttendanceLogs = async () => {
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

const fetchCurrentMonthAttendanceLogs = async () => {
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

const fetchUserCurrentMonthAttendanceLogs = async (user_id) => {
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
    [user_id]
  );
  return result.rows;
};

const getDailyQRCode = async () => {
  const today = new Date().toISOString().split("T")[0];
  const { rows } = await db.query(
    "SELECT * FROM daily_qr_codes WHERE valid_date = $1",
    [today]
  );
  return rows[0];
};

const createDailyQRCode = async () => {
  const today = new Date().toISOString().split("T")[0];
  const qr_code = crypto.randomBytes(32).toString("hex");
  const { rows } = await db.query(
    "INSERT INTO daily_qr_codes (qr_code, valid_date) VALUES ($1, $2) RETURNING *",
    [qr_code, today]
  );
  return rows[0];
};

const ensureDailyQRCode = async () => {
  let qr = await getDailyQRCode();
  if (!qr) {
    qr = await createDailyQRCode();
  }
  return qr;
};

export {
  recordAttendance,
  fetchAllAttendanceLogs,
  fetchUserAttendanceLogs,
  removeAttendanceLog,
  removeUserTodayAttendance,
  fetchTodayAttendanceLogs,
  fetchCurrentMonthAttendanceLogs,
  fetchUserCurrentMonthAttendanceLogs,
  getDailyQRCode,
  createDailyQRCode,
  ensureDailyQRCode,
};
