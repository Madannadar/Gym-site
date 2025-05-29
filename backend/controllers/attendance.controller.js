import QRCode from "qrcode";
import { ensureTodayQR } from "../models/qrModel.js";
import {
  insertAttendance,
  getAllLogs,
  getLogsByUser,
  deleteLog,
  deleteTodaysLogByUserId,
  getTodaysLogs,
  getCurrentMonthLogs,
  getCurrentMonthLogsByUser,
} from "../models/attendance.model.js";

export const createAttendance = async (req, res) => {
  const { user_id, qr_id } = req.body;
  if (!user_id || !qr_id)
    return res.status(400).json({ error: "user_id and qr_id are required." });

  try {
    const rows = await insertAttendance(user_id, qr_id);
    if (rows.length === 0)
      return res.status(409).json({ message: "Attendance already marked." });

    res.status(201).json({ attendance: rows[0] });
  } catch (err) {
    console.error("❌ Error inserting attendance:", err.stack);
    res.status(500).json({ error: "Failed to create attendance." });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const rows = await getAllLogs();
    res.status(200).json({ attendance_logs: rows });
  } catch (err) {
    console.error("❌ Error fetching attendance:", err.stack);
    res.status(500).json({ error: "Failed to fetch attendance." });
  }
};

export const getAttendanceByUser = async (req, res) => {
  try {
    const rows = await getLogsByUser(req.params.user_id);
    res.status(200).json({ logs: rows });
  } catch (err) {
    console.error("❌ Error fetching user's attendance:", err.stack);
    res.status(500).json({ error: "Failed to fetch attendance." });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const rows = await deleteLog(req.params.id);
    if (rows.length === 0)
      return res.status(404).json({ error: "Attendance not found." });

    res.status(200).json({ message: "Attendance deleted", deleted: rows[0] });
  } catch (err) {
    console.error("❌ Error deleting attendance:", err.stack);
    res.status(500).json({ error: "Failed to delete attendance." });
  }
};

export const deleteTodaysAttendanceByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const rows = await deleteTodaysLogByUserId(user_id);
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

export const getTodaysAttendance = async (req, res) => {
  try {
    const rows = await getTodaysLogs();
    res.status(200).json({ todays_attendance: rows });
  } catch (err) {
    console.error("❌ Error fetching today's attendance:", err.stack);
    res.status(500).json({ error: "Failed to fetch today's attendance." });
  }
};

export const getCurrentMonthAttendance = async (req, res) => {
  try {
    const rows = await getCurrentMonthLogs();
    res.status(200).json({ monthly_attendance: rows });
  } catch (err) {
    console.error("❌ Error fetching current month's attendance:", err.stack);
    res
      .status(500)
      .json({ error: "Failed to fetch current month's attendance." });
  }
};

export const getCurrentMonthAttendanceByUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const rows = await getCurrentMonthLogsByUser(user_id);
    res.status(200).json({ monthly_attendance: rows });
  } catch (err) {
    console.error(
      "❌ Error fetching current month attendance for user:",
      err.stack,
    );
    res
      .status(500)
      .json({ error: "Failed to fetch current month's attendance for user." });
  }
};

//
// today attendence qr image
//
export const getTodayQRString = async (req, res) => {
  try {
    const qr = await ensureTodayQR();
    res.json({ qr_code: qr.qr_code });
  } catch (err) {
    console.error("Failed to get QR string:", err);
    res.status(500).json({ error: "Failed to get QR code." });
  }
};

export const getTodayQRImage = async (req, res) => {
  try {
    const qr = await ensureTodayQR();
    const qrImage = await QRCode.toDataURL(qr.qr_code);
    res.json({ qr_image: qrImage });
  } catch (err) {
    console.error("Failed to generate QR image:", err);
    res.status(500).json({ error: "Failed to generate QR code image." });
  }
};
