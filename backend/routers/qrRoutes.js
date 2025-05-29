import express from "express";
import { generateTodayQRCode } from "../controllers/qr.controller.js";

const router = express.Router();

router.post("/generate", generateTodayQRCode); // POST /api/qrcode/generate

export default router;
