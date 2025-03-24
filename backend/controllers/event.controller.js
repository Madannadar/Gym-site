import db from "../config/db.js";

export const createEvent = async (req, res) => {
  const {
    name,
    description,
    cover_image,
    date_time,
    location,
    workout_templates,
  } = req.body;
  try {
    const eventResult = await db.query(
      "INSERT INTO events (name, description, cover_image, event_date, location) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, cover_image, date_time, location],
    );
    const event = eventResult.rows[0];

    if (workout_templates && workout_templates.length > 0) {
      for (const templateId of workout_templates) {
        await db.query(
          "INSERT INTO event_workouts (event_id, workout_template_id) VALUES ($1, $2)",
          [event.id, templateId],
        );
      }
    }
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT e.*, json_agg(wt.id) AS workout_templates FROM events e LEFT JOIN event_workouts ew ON e.id = ew.event_id LEFT JOIN workout_templates wt ON ew.workout_template_id = wt.id GROUP BY e.id",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT e.*, json_agg(wt.id) AS workout_templates FROM events e LEFT JOIN event_workouts ew ON e.id = ew.event_id LEFT JOIN workout_templates wt ON ew.workout_template_id = wt.id WHERE e.id = $1 GROUP BY e.id",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEvent = async (req, res) => {
  const {
    name,
    description,
    cover_image,
    date_time,
    location,
    workout_templates,
  } = req.body;
  try {
    const eventResult = await db.query(
      "UPDATE events SET name = $1, description = $2, cover_image = $3, event_date = $4, location = $5 WHERE id = $6 RETURNING *",
      [name, description, cover_image, date_time, location, req.params.id],
    );
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    await db.query("DELETE FROM event_workouts WHERE event_id = $1", [
      req.params.id,
    ]);
    if (workout_templates && workout_templates.length > 0) {
      for (const templateId of workout_templates) {
        await db.query(
          "INSERT INTO event_workouts (event_id, workout_template_id) VALUES ($1, $2)",
          [req.params.id, templateId],
        );
      }
    }

    res.json(eventResult.rows[0]);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserEvents = async (req, res) => {
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
};

export const enrollUserInEvent = async (req, res) => {
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
};

export const getUserEnrolledEvents = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT e.* FROM events e JOIN event_participants ep ON e.id = ep.event_id WHERE ep.user_id = $1",
      [req.params.userId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching enrolled events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeUserFromEvent = async (req, res) => {
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
};

export const deleteEvent = async (req, res) => {
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
};
