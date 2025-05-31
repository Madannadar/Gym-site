import {
  createHealthLog,
  getRecentHealthLogs,
  updateHealthLog,
  deleteHealthLog,
  getHealthLogById,
} from "../model/health_matric.model.js";

const allowedTypes = ["bmi", "weight"];

export const addLog = async (req, res) => {
  try {
    const { log_type, user_id, value, log_date } = req.body;
    if (!allowedTypes.includes(log_type))
      return res.status(400).json({ error: "Invalid log type" });

    const log = await createHealthLog({
      user_id,
      log_type,
      value,
      log_date: log_date || new Date().toISOString().split("T")[0],
    });

    res.status(201).json({ log });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add log" });
  }
};

export const getLogs = async (req, res) => {
  try {
    const { user_id, type } = req.params;
    if (!allowedTypes.includes(type))
      return res.status(400).json({ error: "Invalid log type" });

    const logs = await getRecentHealthLogs(user_id, type);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

export const updateLog = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    const { value, log_date } = req.body;

    const updated = await updateHealthLog(
      log_id,
      user_id,
      value,
      log_date || new Date().toISOString().split("T")[0],
    );
    if (!updated)
      return res.status(404).json({ error: "Log not found or unauthorized" });

    res.json({ updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update log" });
  }
};

export const deleteLog = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    const deleted = await deleteHealthLog(log_id, user_id);
    if (!deleted)
      return res.status(404).json({ error: "Log not found or unauthorized" });

    res.json({ deleted });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete log" });
  }
};

export const getSingleLog = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    const log = await getHealthLogById(log_id, user_id);
    if (!log) return res.status(404).json({ error: "Log not found" });

    res.json({ log });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch log" });
  }
};
