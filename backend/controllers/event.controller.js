// controllers/eventController.js
import {
  createEvent,
  addWorkoutTemplates,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEventWorkouts,
  getUserEvents,
  enrollUserInEvent,
  removeUserFromEvent,
  getUserEnrolledEvents,
  deleteEvent,
} from "../models/event.model.js";

export const createEventHandler = async (req, res) => {
  const {
    name,
    description,
    cover_image,
    date_time,
    location,
    workout_templates,
  } = req.body;
  try {
    const eventResult = await createEvent(
      name,
      description,
      cover_image,
      date_time,
      location,
    );
    const event = eventResult.rows[0];

    if (workout_templates && workout_templates.length > 0) {
      await addWorkoutTemplates(event.id, workout_templates);
    }

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllEventsHandler = async (req, res) => {
  try {
    const result = await getAllEvents();
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventByIdHandler = async (req, res) => {
  try {
    const result = await getEventById(req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEventHandler = async (req, res) => {
  const {
    name,
    description,
    cover_image,
    date_time,
    location,
    workout_templates,
  } = req.body;
  try {
    const eventResult = await updateEvent(
      req.params.id,
      name,
      description,
      cover_image,
      date_time,
      location,
    );
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    await deleteEventWorkouts(req.params.id);
    if (workout_templates && workout_templates.length > 0) {
      await addWorkoutTemplates(req.params.id, workout_templates);
    }

    res.json(eventResult.rows[0]);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserEventsHandler = async (req, res) => {
  try {
    const result = await getUserEvents(req.params.userId);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserEnrolledEventsHandler = async (req, res) => {
  try {
    const result = await getUserEnrolledEvents(req.params.userId);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching enrolled events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const enrollUserInEventHandler = async (req, res) => {
  const { userId } = req.body;
  try {
    await enrollUserInEvent(req.params.eventId, userId);
    res.status(201).json({ message: "User enrolled successfully" });
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeUserFromEventHandler = async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await removeUserFromEvent(req.params.eventId, userId);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found in event" });
    }
    res.json({ message: "User removed from event successfully" });
  } catch (error) {
    console.error("Error removing user from event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteEventHandler = async (req, res) => {
  try {
    const result = await deleteEvent(req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({
      message: "Event deleted successfully",
      deletedEvent: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
