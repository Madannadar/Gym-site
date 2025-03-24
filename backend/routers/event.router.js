import express from "express";
import {
  createEventHandler,
  getAllEventsHandler,
  getEventByIdHandler,
  updateEventHandler,
  getUserEventsHandler,
  enrollUserInEventHandler,
  getUserEnrolledEventsHandler,
  removeUserFromEventHandler,
  deleteEventHandler,
} from "../controllers/event.controller.js";

const eventRouter = express.Router();

// Event Routes
eventRouter.post("/", createEventHandler); //works
eventRouter.get("/", getAllEventsHandler); //works
eventRouter.get("/:id", getEventByIdHandler); //works
eventRouter.put("/:id", updateEventHandler); //works
eventRouter.delete("/:id", deleteEventHandler);

// User Event Routes
// //not tested bcz of user constraints will test later
eventRouter.get("/users/:userId/events", getUserEventsHandler); // Fetch events created by a user
eventRouter.get("/users/:userId/enrolled-events", getUserEnrolledEventsHandler); // Fetch events a user is enrolled in
eventRouter.post("/:eventId/enroll", enrollUserInEventHandler); // Enroll a user in an event
eventRouter.delete("/:eventId/remove", removeUserFromEventHandler); // Remove a user from an event

export default eventRouter;
