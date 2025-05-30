import {
  recordDietLog,
  fetchAllDietLogs,
  fetchDietLogById,
  fetchUserDietLogs,
  updateDietLogById,
  deleteDietLogById,
} from "../models/diet_log.model.js";

const recordUserDietLog = async (req, res) => {
  try {
    const dietLog = await recordDietLog(req.body);
    res.status(201).json({ dietLog });
  } catch (err) {
    console.error("❌ Failed to record diet log:", err.stack);
    res.status(500).json({ error: "Failed to record diet log" });
  }
};

const fetchAllDietLogs = async (req, res) => {
  try {
    const logs = await fetchAllDietLogs();
    res.status(200).json({ logs });
  } catch (err) {
    console.error("❌ Failed to fetch diet logs:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchDietLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const log = await fetchDietLogById(id);
    if (!log) {
      return res.status(404).json({ error: "Diet log not found" });
    }
    res.status(200).json({ log });
  } catch (err) {
    console.error("❌ Failed to get diet log:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchUserDietLogs = async (req, res) => {
  const { user_id } = req.params;
  const { log_date } = req.query;

  try {
    const logs = await fetchUserDietLogs(user_id, log_date);
    res.status(200).json({ logs });
  } catch (err) {
    console.error("❌ Failed to get user diet logs:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateDietLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await updateDietLogById(id, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ error: "Diet log not found or not updated" });
    }
    res.status(200).json({ updated });
  } catch (err) {
    console.error("❌ Failed to update diet log:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteDietLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await deleteDietLogById(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Diet log not found or already deleted" });
    }
    res.status(200).json({ message: "Diet log deleted successfully", deleted });
  } catch (err) {
    console.error("❌ Failed to delete diet log:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  recordUserDietLog,
  fetchAllDietLogs,
  fetchDietLogById,
  fetchUserDietLogs,
  updateDietLogById,
  deleteDietLogById,
};
