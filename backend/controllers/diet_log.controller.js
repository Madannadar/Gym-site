import {
  recordDietLog,
  fetchAllDietLogs,
  fetchDietLogById,
  fetchUserDietLogs,
  updateDietLogById,
  deleteDietLogById,
} from "../models/diet_log.model.js";

const recordUserDietLogController = async (req, res) => {
  try {
    const dietLog = await recordDietLog(req.body);
    res.status(201).json({ item: dietLog, message: "Diet log recorded successfully" });
  } catch (err) {
    console.error("❌ Failed to record diet log:", err.stack);
    res.status(500).json({ error: { message: "Failed to record diet log" } });
  }
};

const fetchAllDietLogsController = async (req, res) => {
  try {
    const logs = await fetchAllDietLogs();
    res.status(200).json({ items: logs, count: logs.length });
  } catch (err) {
    console.error("❌ Failed to fetch diet logs:", err.stack);
    res.status(500).json({ error: { message: "Failed to fetch diet logs" } });
  }
};

const fetchDietLogByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const log = await fetchDietLogById(id);
    if (!log) {
      return res.status(404).json({ error: { message: "Diet log not found" } });
    }
    res.status(200).json({ item: log });
  } catch (err) {
    console.error("❌ Failed to get diet log:", err.stack);
    res.status(500).json({ error: { message: "Failed to get diet log" } });
  }
};

const fetchUserDietLogsController = async (req, res) => {
  const { user_id } = req.params;
  const { log_date } = req.query;

  try {
    const logs = await fetchUserDietLogs(user_id, log_date);
    res.status(200).json({ items: logs, count: logs.length });
  } catch (err) {
    console.error("❌ Failed to get user diet logs:", err.stack);
    res.status(500).json({ error: { message: "Failed to get user diet logs" } });
  }
};

const updateDietLogByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await updateDietLogById(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: { message: "Diet log not found or not updated" } });
    }
    res.status(200).json({ item: updated, message: "Diet log updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update diet log:", err.stack);
    res.status(500).json({ error: { message: "Failed to update diet log" } });
  }
};

const deleteDietLogByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await deleteDietLogById(id);
    if (!deleted) {
      return res.status(404).json({ error: { message: "Diet log not found or already deleted" } });
    }
    res.status(200).json({ message: "Diet log deleted successfully", item: deleted });
  } catch (err) {
    console.error("❌ Failed to delete diet log:", err.stack);
    res.status(500).json({ error: { message: "Failed to delete diet log" } });
  }
};

export {
  recordUserDietLogController,
  fetchAllDietLogsController,
  fetchDietLogByIdController,
  fetchUserDietLogsController,
  updateDietLogByIdController,
  deleteDietLogByIdController,
};
