import express from "express";
import {
  recordEventTemplate,
  fetchAllEvents,
  fetchEventById,
  recordEventParticipationLog,
  fetchEventLogsByEventId,
  fetchEventLogsByUserId,
} from "../controllers/event.controller.js";

const router = express.Router();

// POST /api/events - create a new event template
router.post("/", recordEventTemplate);

// GET /api/events - fetch all event templates
router.get("/", fetchAllEvents);

// GET /api/events/:event_id - fetch an event template by ID
router.get("/:event_id", fetchEventById);

// POST /api/event-logs - log event participation
router.post("/logs", recordEventParticipationLog);

// GET /api/event-logs/event/:event_id - fetch event logs by event ID
router.get("/logs/event/:event_id", fetchEventLogsByEventId);

// GET /api/event-logs/user/:user_id - fetch event logs by user ID
router.get("/logs/user/:user_id", fetchEventLogsByUserId);

export default router;
