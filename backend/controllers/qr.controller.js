import { getQRForToday, createQRForToday } from "../models/qr.model.js";
import crypto from "crypto";

export const generateTodayQRCode = async (req, res) => {
  try {
    let qr = await getQRForToday();

    if (qr) {
      return res.status(200).json({ message: "QR already exists for today", qr });
    }

    const qr_code = crypto.randomBytes(16).toString("hex"); // 32-char random string

    qr = await createQRForToday(qr_code);
    return res.status(201).json({ message: "QR generated for today", qr });
  } catch (err) {
    console.error("❌ Failed to generate QR:", err.message);
    res.status(500).json({ error: "Failed to generate today's QR" });
  }
};
