import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  getUserEvents,
  enrollUserInEvent,
  getUserEnrolledEvents,
  removeUserFromEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const eventRouter = express.Router();

// Event Routes
eventRouter.post("/", createEvent);
eventRouter.get("/", getAllEvents);
eventRouter.get("/:id", getEventById);
eventRouter.put("/:id", updateEvent);
eventRouter.delete("/:id", deleteEvent);

// User Event Routes
eventRouter.get("/users/:userId/events", getUserEvents); // Fetch events created by a user
eventRouter.get("/users/:userId/enrolled-events", getUserEnrolledEvents); // Fetch events a user is enrolled in
eventRouter.post("/:eventId/enroll", enrollUserInEvent); // Enroll a user in an event
eventRouter.delete("/:eventId/remove", removeUserFromEvent); // Remove a user from an event

export default eventRouter;
