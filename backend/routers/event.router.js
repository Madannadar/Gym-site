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
eventRouter.post("/", createEvent); //works
eventRouter.get("/", getAllEvents); //works
eventRouter.get("/:id", getEventById); //works
eventRouter.put("/:id", updateEvent); //works
eventRouter.delete("/:id", deleteEvent);

// User Event Routes
// //not tested bcz of user constraints will test later
eventRouter.get("/users/:userId/events", getUserEvents); // Fetch events created by a user
eventRouter.get("/users/:userId/enrolled-events", getUserEnrolledEvents); // Fetch events a user is enrolled in
eventRouter.post("/:eventId/enroll", enrollUserInEvent); // Enroll a user in an event
eventRouter.delete("/:eventId/remove", removeUserFromEvent); // Remove a user from an event

export default eventRouter;
