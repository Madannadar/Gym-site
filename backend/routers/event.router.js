import { Router } from "express";
import {
  handleCreateEvent,
  handleGetAllEvents,
  handleGetEventById,
  handleLogParticipation,
  handleGetLogsByEventId,
  handleGetLogsByUserId,
} from "../controllers/event.controller.js";

const router = Router();

// Event Template Routes
router.post("/events", handleCreateEvent);
router.get("/events", handleGetAllEvents);
router.get("/events/:event_id", handleGetEventById);

// Event Logs Routes
router.post("/event-logs", handleLogParticipation);
router.get("/event-logs/event/:event_id", handleGetLogsByEventId);
router.get("/event-logs/user/:user_id", handleGetLogsByUserId);

export default router;
