import express from "express";
import {
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
} from "../controllers/attendance.controller.js";

const router = express.Router();

// GET /qr/string - get today's QR code string
router.get("/qr/string", getTodayQRCodeString);

// GET /qr/image - get today's QR code image
router.get("/qr/image", getTodayQRCodeImage);

// POST /log - record user attendance
router.post("/log", recordUserAttendance);

// GET /logs - fetch all attendance logs
router.get("/logs", fetchAllAttendance);

// GET /user/:user_id - fetch attendance logs for a specific user
router.get("/user/:user_id", fetchUserAttendance);

// DELETE /delete/:id - delete a specific attendance record
router.delete("/delete/:id", deleteAttendanceRecord);

// DELETE /user/today/:user_id - delete today's attendance for a user
router.delete("/user/today/:user_id", deleteUserTodayAttendanceRecord);

// GET /today - fetch today's attendance logs
router.get("/today", fetchTodayAttendance);

// GET /month - fetch current month's attendance logs
router.get("/month", fetchCurrentMonthAttendance);

// GET /user/month/:user_id - fetch current month's attendance for a user
router.get("/user/month/:user_id", fetchUserCurrentMonthAttendance);

export default router;
