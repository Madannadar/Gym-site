import express from "express";
import db from "../config/db";
const eventRouter = express.eventRouter();

// Create an event
eventRouter.post("/events", async (req, res) => {
  const {
    name,
    description,
    cover_image,
    date_time,
    location,
    workout_templates,
  } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO events (name, description, cover_image, date_time, location, workout_templates) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, cover_image, date_time, location, workout_templates],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all events
eventRouter.get("/events", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM events");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get an event by ID
eventRouter.get("/events/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM events WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get events a user has participated in
eventRouter.get("/users/:userId/events", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT e.* FROM events e JOIN event_participants ep ON e.id = ep.event_id WHERE ep.user_id = $1",
      [req.params.userId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Enroll user in an event
eventRouter.post("/events/:eventId/enroll", async (req, res) => {
  const { userId } = req.body;
  try {
    await db.query(
      "INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2) RETURNING *",
      [req.params.eventId, userId],
    );
    res.status(201).json({ message: "User enrolled successfully" });
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove user from an event
eventRouter.delete("/events/:eventId/remove", async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await db.query(
      "DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2 RETURNING *",
      [req.params.eventId, userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found in event" });
    }
    res.json({ message: "User removed from event successfully" });
  } catch (error) {
    console.error("Error removing user from event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an event by ID
eventRouter.delete("/events/:id", async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM events WHERE id = $1 RETURNING *",
      [req.params.id],
    );
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
});

export default eventRouter;
