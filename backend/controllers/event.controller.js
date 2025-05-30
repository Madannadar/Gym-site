import {
  recordEvent,
  fetchAllEvents,
  fetchEventById,
  recordEventParticipation,
  fetchEventLogsByEventId,
  fetchEventLogsByUserId,
} from "../models/event.model.js";

const recordEventTemplate = async (req, res) => {
  try {
    const event = await recordEvent(req.body);
    res.status(201).json({ item: event });
  } catch (err) {
    console.error("❌ Record Event Error:", err.stack);
    res.status(500).json({ error: "Failed to record event." });
  }
};

const fetchAllEvents = async (req, res) => {
  try {
    const events = await fetchAllEvents();
    res.json({ items: events });
  } catch (err) {
    console.error("❌ Fetch Events Error:", err.stack);
    res.status(500).json({ error: "Failed to fetch events." });
  }
};

const fetchEventById = async (req, res) => {
  try {
    const event = await fetchEventById(req.params.event_id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ item: event });
  } catch (err) {
    console.error("❌ Fetch Event Error:", err.stack);
    res.status(500).json({ error: "Failed to fetch event." });
  }
};

const recordEventParticipationLog = async (req, res) => {
  try {
    const log = await recordEventParticipation(req.body);
    res.status(201).json({ item: log });
  } catch (err) {
    console.error("❌ Record Event Participation Error:", err.stack);
    res.status(500).json({ error: "Failed to log event participation." });
  }
};

const fetchEventLogsByEventId = async (req, res) => {
  try {
    const logs = await fetchEventLogsByEventId(req.params.event_id);
    res.json({ items: logs });
  } catch (err) {
    console.error("❌ Fetch Event Logs Error:", err.stack);
    res.status(500).json({ error: "Failed to fetch event logs." }));
  }
};

const fetchEventLogsByUserId = async (req, res) => {
  try {
    const logs = await fetchEventLogsByUserId(req.params.user_id);
    res.json({ items: logs });
  } catch (err) {
    console.error("❌ Fetch Event Logs Error:", err.stack);
    res.status(500).json({ error: "Failed to fetch event logs." });
  }
};

export {
  recordEventTemplate,
  fetchAllEvents,
  fetchEventById,
  recordEventParticipationLog,
  fetchEventLogsByEventId,
  fetchEventLogsByUserId,
};
