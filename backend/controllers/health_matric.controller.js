import {
  recordHealthLog,
  fetchRecentHealthLogs,
  updateHealthLogById,
  deleteHealthLogById,
  fetchHealthLogById,
} from "../models/health_matric.model.js";

const allowedTypes = ["bmi", "weight"];

const recordHealthLogEntry = async (req, res) => {
  try {
    const { log_type, user_id, value, log_date } = req.body;
    if (!allowedTypes.includes(log_type))
      return res.status(400).json({ error: { message: "Invalid log type" } });

    const log = await recordHealthLog({
      user_id,
      log_type,
      value,
      log_date: log_date || new Date().toISOString().split("T")[0],
    });

    res.status(201).json({ item: log });
  } catch (err) {
    console.error("❌ Record Health Log Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to record health log" } });
  }
};

const fetchRecentHealthLogsByType = async (req, res) => {
  try {
    const { user_id, type } = req.params;
    if (!allowedTypes.includes(type))
      return res.status(400).json({ error: { message: "Invalid log type" } });

    const logs = await fetchRecentHealthLogs(user_id, type);
    res.json({ items: logs });
  } catch (err) {
    console.error("❌ Fetch Health Logs Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch health logs" } });
  }
};

const updateHealthLogByIdEntry = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    const { value, log_date } = req.body;

    const updated = await updateHealthLogById(
      log_id,
      user_id,
      value,
      log_date || new Date().toISOString().split("T")[0],
    );
    if (!updated)
      return res
        .status(404)
        .json({ error: { message: "Health log not found or unauthorized" } });

    res.json({ item: updated });
  } catch (err) {
    console.error("❌ Update Health Log Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to update health log" } });
  }
};

const deleteHealthLogByIdEntry = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    const deleted = await deleteHealthLogById(log_id, user_id);
    if (!deleted)
      return res
        .status(404)
        .json({ error: { message: "Health log not found or unauthorized" } });

    res.json({ message: "Health log deleted", item: deleted });
  } catch (err) {
    console.error("❌ Delete Health Log Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to delete health log" } });
  }
};

const fetchHealthLogByIdEntry = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    const log = await fetchHealthLogById(log_id, user_id);
    if (!log)
      return res
        .status(404)
        .json({ error: { message: "Health log not found" } });

    res.json({ item: log });
  } catch (err) {
    console.error("❌ Fetch Health Log Error:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch health log" } });
  }
};

export {
  recordHealthLogEntry,
  fetchRecentHealthLogsByType,
  updateHealthLogByIdEntry,
  deleteHealthLogByIdEntry,
  fetchHealthLogByIdEntry,
};
