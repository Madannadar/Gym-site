import {
  createEvent,
  getAllEvents,
  getEventById,
  logEventParticipation,
  getEventLogsByEventId,
  getEventLogsByUserId,
} from "../model/event.model.js";

// Event Template Controllers
export const handleCreateEvent = async (req, res) => {
  try {
    const event = await createEvent(req.body);
    res.status(201).json({ event });
  } catch (err) {
    console.error("❌ Failed to create event:", err.stack);
    res.status(500).json({ error: "Failed to create event." });
  }
};

export const handleGetAllEvents = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json({ events });
  } catch (err) {
    console.error("❌ Failed to fetch events:", err.stack);
    res.status(500).json({ error: "Failed to fetch events." });
  }
};

export const handleGetEventById = async (req, res) => {
  try {
    const event = await getEventById(req.params.event_id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ event });
  } catch (err) {
    console.error("❌ Failed to fetch event:", err.stack);
    res.status(500).json({ error: "Failed to fetch event." });
  }
};

// Event Log Controllers
export const handleLogParticipation = async (req, res) => {
  try {
    const log = await logEventParticipation(req.body);
    res.status(201).json({ log });
  } catch (err) {
    console.error("❌ Failed to log event participation:", err.stack);
    res.status(500).json({ error: "Failed to log event participation." });
  }
};

export const handleGetLogsByEventId = async (req, res) => {
  try {
    const logs = await getEventLogsByEventId(req.params.event_id);
    res.json({ logs });
  } catch (err) {
    console.error("❌ Failed to fetch logs:", err.stack);
    res.status(500).json({ error: "Failed to fetch logs." });
  }
};

export const handleGetLogsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id || isNaN(parseInt(user_id))) {
      return res.status(400).json({ error: "Invalid or missing user ID" });
    }
    const logs = await getEventLogsByUserId(parseInt(user_id));
    res.json({ logs });
  } catch (err) {
    console.error("❌ Failed to fetch logs:", err.stack);
    res.status(500).json({ error: "Failed to fetch logs." });
  }
};
