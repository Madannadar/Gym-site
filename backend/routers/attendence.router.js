import express from "express";
import {
  createAttendance,
  getAllAttendance,
  getAttendanceByUser,
  deleteAttendance,
  deleteTodaysAttendanceByUserId,
  getTodaysAttendance,
  getCurrentMonthAttendance,
  getCurrentMonthAttendanceByUser,
  getTodayQRImage,
  getTodayQRString,
} from "../controllers/attendance.controller.js";

const router = express.Router();
//all works

router.get("/qr/string", getTodayQRString);
router.get("/qr/image", getTodayQRImage);
router.post("/log", createAttendance); //qr id is not going in the tabel always so thatneed to be fixed
router.get("/logs", getAllAttendance);
router.get("/user/:user_id", getAttendanceByUser);

router.delete("/delete/:id", deleteAttendance);
router.delete("/user/today/:user_id", deleteTodaysAttendanceByUserId);

router.get("/today", getTodaysAttendance);
router.get("/month", getCurrentMonthAttendance);
router.get("/user/month/:user_id", getCurrentMonthAttendanceByUser);

export default router;
