import db from "../config/db.js";
import crypto from "crypto";

export async function countDistinctAttendanceDays(user_id) {
  const query = `
    SELECT COUNT(DISTINCT DATE(scanned_at)) AS total_days
    FROM attendance_log
    WHERE user_id = $1 AND is_valid = true;
  `;
  const { rows } = await db.query(query, [user_id]);
  return parseInt(rows[0]?.total_days || 0, 10);
}

export async function calculateUserStreak(user_id) {
  const query = `
    SELECT DATE(scanned_at) AS day
    FROM attendance_log
    WHERE user_id = $1 AND is_valid = true
    GROUP BY day
    ORDER BY day DESC;
  `;
  const { rows } = await db.query(query, [user_id]);

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // normalize time

  for (const { day } of rows) {
    const attendanceDate = new Date(day);
    attendanceDate.setHours(0, 0, 0, 0);

    if (attendanceDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // move to previous day
    } else {
      break;
    }
  }

  return streak;
}

//duration logic is pending and have to e sorted out

export async function getWeeklyDuration(user_id) {
  const query = `
    SELECT SUM(EXTRACT(EPOCH FROM (scanned_out - scanned_at))) AS duration
    FROM attendance
    WHERE user_id = $1 AND is_valid = true
      AND scanned_at >= NOW() - INTERVAL '7 days';
  `;
  const { rows } = await db.query(query, [user_id]);
  return Math.round(parseFloat(rows[0]?.duration || 0)); // in seconds
}

export async function getMonthlyDuration(user_id) {
  const query = `
    SELECT SUM(EXTRACT(EPOCH FROM (scanned_out - scanned_at))) AS duration
    FROM attendance
    WHERE user_id = $1 AND is_valid = true
      AND DATE_TRUNC('month', scanned_at) = DATE_TRUNC('month', CURRENT_DATE);
  `;
  const { rows } = await db.query(query, [user_id]);
  return Math.round(parseFloat(rows[0]?.duration || 0)); // in seconds
}

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

export async function updateUserMetrics(user_id) {
  const totalDays = await countDistinctAttendanceDays(user_id);
  const currentStreak = await calculateUserStreak(user_id);
  const weeklyDuration = await getWeeklyDuration(user_id);
  const monthlyDuration = await getMonthlyDuration(user_id);

  const query = `
    INSERT INTO attendance_metrics (user_id, total_days, current_streak, weekly_duration, monthly_duration, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      total_days = EXCLUDED.total_days,
      current_streak = EXCLUDED.current_streak,
      weekly_duration = EXCLUDED.weekly_duration,
      monthly_duration = EXCLUDED.monthly_duration,
      updated_at = NOW();
  `;
  await db.query(query, [
    user_id,
    totalDays,
    currentStreak,
    weeklyDuration,
    monthlyDuration,
  ]);
}

// Get all attendance logs
export const getAllLogs = async () => {
  const result = await db.query(`

    SELECT al.*, u.first_name, u.last_name, q.valid_date
    FROM attendance_logs al
    JOIN users u ON u.id = al.user_id

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
      AND q.valid_date = CURRENT_DATE
      AND al.user_id = $1
    RETURNING al.*;
  `,
    [user_id],
  );

  return result.rows;
};

export const getTodaysLogs = async () => {
  const result = await db.query(`

    SELECT al.*, u.first_name, u.last_name, q.valid_date
    FROM attendance_logs al
    JOIN users u ON u.id = al.user_id

    JOIN daily_qr_codes q ON q.qr_id = al.qr_id
    WHERE q.valid_date = CURRENT_DATE
    ORDER BY al.scanned_at DESC;
  `);
  return result.rows;
};

export const getCurrentMonthLogs = async () => {
  const result = await db.query(`

    SELECT al.*, u.first_name, u.last_name, q.valid_date
    FROM attendance_logs al
    JOIN users u ON u.id = al.user_id

    JOIN daily_qr_codes q ON q.qr_id = al.qr_id
    WHERE DATE_TRUNC('month', q.valid_date) = DATE_TRUNC('month', CURRENT_DATE)
    ORDER BY al.scanned_at DESC;
  `);
  return result.rows;
};

export const getCurrentMonthLogsByUser = async (user_id) => {
  const result = await db.query(
    `

    SELECT al.*, u.first_name, u.last_name, q.valid_date
    FROM attendance_logs al
    JOIN users u ON u.id = al.user_id

    JOIN daily_qr_codes q ON q.qr_id = al.qr_id
    WHERE al.user_id = $1
      AND DATE_TRUNC('month', q.valid_date) = DATE_TRUNC('month', CURRENT_DATE)
    ORDER BY al.scanned_at DESC;
  `,
    [user_id],
  );

  return result.rows;
};

// QR code handlers

//
//attendence qr code handlers
//

export const getTodayQR = async () => {
  const today = new Date().toISOString().split("T")[0];
  const { rows } = await db.query(
    "SELECT * FROM daily_qr_codes WHERE valid_date = $1",
    [today],
  );
  return rows[0];
};

export const createTodayQR = async () => {
  const today = new Date().toISOString().split("T")[0];
  const qr_code = crypto.randomBytes(32).toString("hex");
  const { rows } = await db.query(
    "INSERT INTO daily_qr_codes (qr_code, valid_date) VALUES ($1, $2) RETURNING *",
    [qr_code, today],
  );
  return rows[0];
};

export const ensureTodayQR = async () => {
  let qr = await getTodayQR();
  if (!qr) {
    qr = await createTodayQR();
  }
  return qr;
};
