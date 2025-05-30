import QRCode from "qrcode";
import { ensureDailyQRCode } from "../models/qrModel.js";
import {
  recordAttendance,
  fetchAllAttendanceLogs,
  fetchUserAttendanceLogs,
  removeAttendanceLog,
  removeUserTodayAttendance,
  fetchTodayAttendanceLogs,
  fetchCurrentMonthAttendanceLogs,
  fetchUserCurrentMonthAttendanceLogs,
} from "../models/attendance.model.js";

const recordUserAttendance = async (req, res) => {
  const { user_id, scanned_qr_code } = req.body;
  if (!user_id || !scanned_qr_code)
    return res
      .status(400)
      .json({ error: "user_id and scanned_qr_code are required." });

  try {
    const todayQR = await ensureDailyQRCode();

    if (scanned_qr_code !== todayQR.qr_code)
      return res.status(403).json({ error: "Invalid or expired QR code." });

    const rows = await recordAttendance(user_id, todayQR.id);
    if (rows.length === 0)
      return res.status(409).json({ message: "Attendance already marked." });

    res.status(201).json({ attendance: rows[0] });
  } catch (err) {
    console.error("❌ Error verifying QR and recording attendance:", err.stack);
    res.status(500).json({ error: "Failed to verify and record attendance." });
  }
};

const fetchAllAttendance = async (req, res) => {
  try {
    const rows = await fetchAllAttendanceLogs();
    res.status(200).json({ attendance_logs: rows });
  } catch (err) {
    console.error("❌ Error fetching attendance:", err.stack);
    res.status(500).json({ error: "Failed to fetch attendance." });
  }
};

const fetchUserAttendance = async (req, res) => {
  try {
    const rows = await fetchUserAttendanceLogs(req.params.user_id);
    res.status(200).json({ logs: rows });
  } catch (err) {
    console.error("❌ Error fetching user's attendance:", err.stack);
    res.status(500).json({ error: "Failed to fetch attendance." });
  }
};

const deleteAttendanceRecord = async (req, res) => {
  try {
    const rows = await removeAttendanceLog(req.params.id);
    if (rows.length === 0)
      return res.status(404).json({ error: "Attendance not found." });

    res.status(200).json({ message: "Attendance deleted", deleted: rows[0] });
  } catch (err) {
    console.error("❌ Error deleting attendance:", err.stack);
    res.status(500).json({ error: "Failed to delete attendance." });
  }
};

const deleteUserTodayAttendanceRecord = async (req, res) => {
  const { user_id } = req.params;

  try {
    const rows = await removeUserTodayAttendance(user_id);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ message: "No attendance found for user today." });

    res
      .status(200)
      .json({ message: "Today's attendance deleted", deleted: rows[0] });
  } catch (err) {
    console.error("❌ Error deleting today's attendance for user:", err.stack);
    res
      .status(500)
      .json({ error: "Failed to delete today's attendance for user." });
  }
};

const fetchTodayAttendance = async (req, res) => {
  try {
    const rows = await fetchTodayAttendanceLogs();
    res.status(200).json({ todays_attendance: rows });
  } catch (err) {
    console.error("❌ Error fetching today's attendance:", err.stack);
    res.status(500).json({ error: "Failed to fetch today's attendance." });
  }
};

const fetchCurrentMonthAttendance = async (req, res) => {
  try {
    const rows = await fetchCurrentMonthAttendanceLogs();
    res.status(200).json({ monthly_attendance: rows });
  } catch (err) {
    console.error("❌ Error fetching current month's attendance:", err.stack);
    res
      .status(500)
      .json({ error: "Failed to fetch current month's attendance." });
  }
};

const fetchUserCurrentMonthAttendance = async (req, res) => {
  const { user_id } = req.params;

  try {
    const rows = await fetchUserCurrentMonthAttendanceLogs(user_id);
    res.status(200).json({ monthly_attendance: rows });
  } catch (err) {
    console.error(
      "❌ Error fetching current month attendance for user:",
      err.stack
    );
    res
      .status(500)
      .json({ error: "Failed to fetch current month's attendance for user." });
  }
};

const getTodayQRCodeString = async (req, res) => {
  try {
    const qr = await ensureDailyQRCode();
    res.json({ qr_code: qr.qr_code });
  } catch (err) {
    console.error("Failed to get QR string:", err);
    res.status(500).json({ error: "Failed to get QR code." });
  }
};

const getTodayQRCodeImage = async (req, res) => {
  try {
    const qr = await ensureDailyQRCode();
    const qrImage = await QRCode.toDataURL(qr.qr_code);
    res.json({ qr_image: qrImage });
  } catch (err) {
    console.error("Failed to generate QR image:", err);
    res.status(500).json({ error: "Failed to generate QR code image." });
  }
};

export {
  recordUserAttendance,
  fetchAllAttendance,
  fetchUserAttendance,
  deleteAttendanceRecord,
  deleteUserTodayAttendanceRecord,
  fetchTodayAttendance,
  fetchCurrentMonthAttendance,
  fetchUserCurrentMonthAttendance,
  getTodayQRCodeString,
  getTodayQRCodeImage,
};
