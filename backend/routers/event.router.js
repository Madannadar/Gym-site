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
eventRouter.delete("/:id", deleteEventHandler); //works

// User Event Routes
// //not tested bcz of user constraints will test later
eventRouter.get("/users/:userId/events", getUserEventsHandler); //not works properly // Fetch events created by a user 
eventRouter.get("/users/:userId/enrolled-events", getUserEnrolledEventsHandler); //works // Fetch events a user is enrolled in
eventRouter.post("/:eventId/enroll", enrollUserInEventHandler); //works  // Enroll a user in an event 
eventRouter.delete("/:eventId/remove", removeUserFromEventHandler); //works  // Remove a user from an event

export default eventRouter;
