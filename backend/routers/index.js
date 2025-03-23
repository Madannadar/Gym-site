import express from "express";
import eventRouter from "./event.router.js";

const router = express.Router();

// Use event routes
router.use("/events", eventRouter);

export default router;
