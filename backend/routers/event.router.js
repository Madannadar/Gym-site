import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  getUserEvents,
  enrollUserInEvent,
  removeUserFromEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const eventRouter = express.Router();

// Routes
eventRouter.post("/", createEvent);
eventRouter.get("/", getAllEvents);
eventRouter.get("/:id", getEventById);
eventRouter.get("/users/:userId", getUserEvents);
eventRouter.post("/:eventId/enroll", enrollUserInEvent);
eventRouter.delete("/:eventId/remove", removeUserFromEvent);
eventRouter.delete("/:id", deleteEvent);

export default eventRouter;
