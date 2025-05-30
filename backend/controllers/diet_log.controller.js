import {
  insertDietLog,
  getAllDietLogs,
  getDietLogById,
  getDietLogsByUser,
  updateDietLog,
  deleteDietLog,
} from "../model/diet_log.model.js";

export const createDietLog = async (req, res) => {
  try {
    const dietLog = await insertDietLog(req.body);
    res.status(201).json({ dietLog });
  } catch (err) {
    console.error("❌ Failed to insert diet log:", err.stack);
    res.status(500).json({ error: "Failed to insert diet log" });
  }
};

export const getDietLogs = async (req, res) => {
  try {
    const logs = await getAllDietLogs();
    res.status(200).json({ logs });
  } catch (err) {
    console.error("❌ Failed to fetch diet logs:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getDietLog = async (req, res) => {
  const { id } = req.params;
  try {
    const log = await getDietLogById(id);
    if (!log) {
      return res.status(404).json({ error: "Diet log not found" });
    }
    res.status(200).json({ log });
  } catch (err) {
    console.error("❌ Failed to get diet log:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserDietLogs = async (req, res) => {
  const { user_id } = req.params;
  const { log_date } = req.query;

  try {
    const logs = await getDietLogsByUser(user_id, log_date);
    res.status(200).json({ logs });
  } catch (err) {
    console.error("❌ Failed to get user diet logs:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const editDietLog = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await updateDietLog(id, req.body);
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

export const removeDietLog = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await deleteDietLog(id);
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
