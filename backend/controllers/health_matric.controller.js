import {
  createHealthLog,
  getRecentHealthLogs,
  updateHealthLog,
  deleteHealthLog,
  getHealthLogById,
} from "../model/health_matric.model.js";

const allowedTypes = ["bmi", "weight", "height"];

export const addLog = async (req, res) => {
  try {
    const { log_type, user_id, value, height, weight, log_date } = req.body;
    if (!allowedTypes.includes(log_type))
      return res.status(400).json({ error: "Invalid log type" });
    if (!user_id || isNaN(parseInt(user_id)))
      return res.status(400).json({ error: "Invalid or missing user ID" });

    const log = await createHealthLog({
      user_id: parseInt(user_id),
      log_type,
      value,
      height,
      weight,
      log_date: log_date || new Date().toISOString().split("T")[0],
    });

    res.status(201).json({ log });
  } catch (err) {
    console.error("Error adding log:", err);
    res.status(500).json({ error: "Failed to add log" });
  }
};

export const getLogs = async (req, res) => {
  try {
    const { user_id, type } = req.params;
    if (!allowedTypes.includes(type))
      return res.status(400).json({ error: "Invalid log type" });
    if (!user_id || isNaN(parseInt(user_id)))
      return res.status(400).json({ error: "Invalid or missing user ID" });

    const logs = await getRecentHealthLogs(parseInt(user_id), type);
    res.json({ logs });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

export const updateLog = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    const { value, height, weight, log_date } = req.body;

    if (!user_id || isNaN(parseInt(user_id)))
      return res.status(400).json({ error: "Invalid or missing user ID" });


    const updated = await updateHealthLog(
      log_id,
      parseInt(user_id),
      value,
      height,
      weight,

      log_date || new Date().toISOString().split("T")[0]

    );
    if (!updated)
      return res.status(404).json({ error: "Log not found or unauthorized" });

    res.json({ updated });
  } catch (err) {
    console.error("Error updating log:", err);
    res.status(500).json({ error: "Failed to update log" });
  }
};

export const deleteLog = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    if (!user_id || isNaN(parseInt(user_id)))
      return res.status(400).json({ error: "Invalid or missing user ID" });

    const deleted = await deleteHealthLog(log_id, parseInt(user_id));
    if (!deleted)
      return res.status(404).json({ error: "Log not found or unauthorized" });

    res.json({ deleted });
  } catch (err) {
    console.error("Error deleting log:", err);
    res.status(500).json({ error: "Failed to delete log" });
  }
};

export const getSingleLog = async (req, res) => {
  try {
    const { log_id, user_id } = req.params;
    if (!user_id || isNaN(parseInt(user_id)))
      return res.status(400).json({ error: "Invalid or missing user ID" });

    const log = await getHealthLogById(log_id, parseInt(user_id));
    if (!log) return res.status(404).json({ error: "Log not found" });

    res.json({ log });
  } catch (err) {
    console.error("Error fetching log:", err);
    res.status(500).json({ error: "Failed to fetch log" });
  }
};
