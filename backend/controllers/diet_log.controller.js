import {
  insertDietLog,
  getAllDietLogs,
  getDietLogById,
  getDietLogsByUser,
  updateDietLog,
  deleteDietLog,
} from "../model/diet_log.model.js";
import { insertDishModel } from "../model/dish.model.js"; // Added import
import db from "../config/db.js";

const validateDishIds = async (meals, fieldName) => {
  if (!meals || !Array.isArray(meals)) return true;
  try {
    for (const meal of meals) {
      if (!meal.dish_id || isNaN(parseInt(meal.dish_id))) {
        throw new Error(`Missing or invalid dish_id in ${fieldName}`);
      }
      const dishCheck = await db.query(
        "SELECT dish_id FROM diet_dishes WHERE dish_id = $1",
        [parseInt(meal.dish_id)]
      );
      if (dishCheck.rows.length === 0) {
        throw new Error(`Invalid dish_id ${meal.dish_id} in ${fieldName}`);
      }
    }
    return true;
  } catch (err) {
    console.error(`Validation error in ${fieldName}:`, err.message);
    throw err;
  }
};

export const createDishAndLog = async (req, res) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const { dish, log } = req.body;

    // Validate dish data
    if (!dish.created_by || !dish.dish_name || !dish.meal_type) {
      throw new Error("Missing required dish fields: created_by, dish_name, meal_type");
    }
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [dish.created_by]);
    if (userCheck.rows.length === 0) {
      throw new Error("Invalid user ID for dish");
    }

    // Insert dish
    const dishResult = await insertDishModel({
      created_by: dish.created_by,
      dish_name: dish.dish_name,
      calories: Number(dish.calories) || 0,
      protein: Number(dish.protein) || 0,
      fat: Number(dish.fat) || 0,
      carbs: Number(dish.carbs) || 0,
      units: dish.units,
      meal_type: dish.meal_type,
      is_vegetarian: dish.is_vegetarian || false,
      unit_value: Number(dish.unit_value) || null,
    });
    console.log("✅ Dish inserted:", dishResult);

    // Update log with dish_id
    const mealField = Object.keys(log).find(
      (key) => ["breakfast", "lunch", "dinner", "snacks"].includes(key)
    );
    if (!mealField || !log[mealField][0]) {
      throw new Error("Invalid meal field in log data");
    }
    log[mealField][0].dish_id = dishResult.dish_id;

    // Validate log data
    if (!log.user_id || !log.log_date) {
      throw new Error("Missing required log fields: user_id, log_date");
    }
    const logUserCheck = await db.query("SELECT id FROM users WHERE id = $1", [log.user_id]);
    if (logUserCheck.rows.length === 0) {
      throw new Error("Invalid user ID for log");
    }

    // Validate meal fields
    const mealFields = { breakfast: log.breakfast, lunch: log.lunch, dinner: log.dinner, snacks: log.snacks };
    for (const [field, meals] of Object.entries(mealFields)) {
      await validateDishIds(meals, field);
    }

    // Insert diet log
    const logResult = await insertDietLog(log);
    console.log("✅ Diet log inserted:", logResult);

    await client.query("COMMIT");
    res.status(201).json({ dish: dishResult, dietLog: logResult });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Transaction Error:", err.stack);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const createDietLog = async (req, res) => {
  console.log("🔍 Creating diet log with payload:", req.body);
  try {
    const { user_id, breakfast, lunch, dinner, snacks } = req.body;
    if (!user_id || isNaN(parseInt(user_id))) {
      console.error("❌ Invalid user_id:", user_id);
      return res.status(400).json({ error: "Invalid or missing user ID" });
    }
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      parseInt(user_id),
    ]);
    if (userCheck.rows.length === 0) {
      console.error("❌ User not found for ID:", user_id);
      return res.status(400).json({ error: "User not found" });
    }

    const mealFields = { breakfast, lunch, dinner, snacks };
    for (const [field, meals] of Object.entries(mealFields)) {
      await validateDishIds(meals, field);
    }

    const dietLog = await insertDietLog(req.body);
    console.log("✅ Diet log created:", dietLog);
    res.status(201).json({ dietLog });
  } catch (err) {
    console.error("❌ Failed to insert diet log:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// Other exports remain unchanged
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
    if (!user_id || isNaN(parseInt(user_id))) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      parseInt(user_id),
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }
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
    const { breakfast, lunch, dinner, snacks } = req.body;
    const mealFields = { breakfast, lunch, dinner, snacks };
    for (const [field, meals] of Object.entries(mealFields)) {
      await validateDishIds(meals, field);
    }

    const updated = await updateDietLog(id, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ error: "Diet log not found or not updated" });
    }
    res.status(200).json({ updated });
  } catch (err) {
    console.error("❌ Failed to update diet log:", err.stack);
    res.status(400).json({ error: err.message || "Internal Server Error" });
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
    res.status(200).json({ message: "Diet log deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete diet log:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
