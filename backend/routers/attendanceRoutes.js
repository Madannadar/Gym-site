import express from "express";
import {
  createAttendance,
  getAllAttendance,
  getAttendanceByUser,
  deleteAttendance,
  deleteTodaysAttendanceByUserId,
  getTodaysAttendance,
  getCurrentMonthAttendance,
  getCurrentMonthAttendanceByUser
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/log", createAttendance);
router.get("/logs", getAllAttendance);
router.get("/user/:user_id", getAttendanceByUser);
router.delete("/delete/:id", deleteAttendance);
router.delete("/user/today/:user_id", deleteTodaysAttendanceByUserId); 
router.get("/today", getTodaysAttendance);
router.get("/month", getCurrentMonthAttendance);
router.get("/user/month/:user_id", getCurrentMonthAttendanceByUser);

export default router;
