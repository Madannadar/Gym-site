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
router.post("/", handleCreateEvent);
router.get("/", handleGetAllEvents);
router.get("/:event_id", handleGetEventById);

// Event Logs Routes
router.post("/logs", handleLogParticipation); //problem with generating log of participation
router.get("/logs/:event_id", handleGetLogsByEventId);
router.get("/logs/user/:user_id", handleGetLogsByUserId);

export default router;
