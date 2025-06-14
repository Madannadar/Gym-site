import {
  insertDietLog,
  getAllDietLogs,
  getDietLogById,
  getDietLogsByUser,
  updateDietLog,
  deleteDietLog,
} from "../model/diet_log.model.js";
import { insertDishModel } from "../model/dish.model.js";
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

const parseJson = (val) => {
  if (!val || typeof val !== "string") {
    console.warn("⚠️ Invalid JSON value, returning empty array:", val);
    return [];
  }
  try {
    return JSON.parse(val);
  } catch (err) {
    console.error("❌ JSON parse error:", err.message, "Value:", val);
    return [];
  }
};

export const createDietLog = async (req, res) => {
  console.log("🔍 Creating diet log with payload:", JSON.stringify(req.body, null, 2));
  try {
    await db.query("BEGIN");

    const { user_id, log_date, breakfast, lunch, dinner, snacks, total_calories, proteins, carbs, fats } = req.body;

    if (!user_id || isNaN(parseInt(user_id))) {
      console.error("❌ Invalid user_id:", user_id);
      return res.status(400).json({ error: "Invalid or missing user ID" });
    }
    const parsedUserId = parseInt(user_id);
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [parsedUserId]);
    if (userCheck.rows.length === 0) {
      console.error("❌ User not found for ID:", parsedUserId);
      return res.status(400).json({ error: "User not found" });
    }

    // Normalize log_date to YYYY-MM-DD
    const normalizedLogDate = log_date.split("T")[0]; // e.g., "2025-06-14"
    console.log("🔍 Normalized log_date:", normalizedLogDate);

    const mealFields = { breakfast, lunch, dinner, snacks };
    for (const [field, meals] of Object.entries(mealFields)) {
      if (meals && !Array.isArray(meals)) {
        console.error(`❌ Invalid ${field} format:`, meals);
        return res.status(400).json({ error: `Invalid ${field} format, expected array` });
      }
      await validateDishIds(meals, field);
    }

    // Verify totals from payload
    const calculatedTotals = Object.values(mealFields).reduce(
      (acc, meals) => {
        if (!meals || !Array.isArray(meals)) return acc;
        return meals.reduce(
          (innerAcc, meal) => ({
            calories: innerAcc.calories + (Number(meal.actual_calories) || 0),
            proteins: innerAcc.proteins + (Number(meal.proteins) || 0),
            carbs: innerAcc.carbs + (Number(meal.carbs) || 0),
            fats: innerAcc.fats + (Number(meal.fats) || 0),
          }),
          acc
        );
      },
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );

    if (
      calculatedTotals.calories !== Number(total_calories) ||
      calculatedTotals.proteins !== Number(proteins) ||
      calculatedTotals.carbs !== Number(carbs) ||
      calculatedTotals.fats !== Number(fats)
    ) {
      console.warn("⚠️ Totals mismatch:", { calculatedTotals, payloadTotals: { total_calories, proteins, carbs, fats } });
    }

    const existingLog = await db.query(
      "SELECT * FROM diet_logs WHERE user_id = $1 AND log_date::date = $2",
      [parsedUserId, normalizedLogDate]
    );

    let dietLog;
    if (existingLog.rows.length > 0) {
      const existing = existingLog.rows[0];
      const updatedMeals = {
        breakfast: Array.isArray(breakfast) ? breakfast : parseJson(existing.breakfast),
        lunch: Array.isArray(lunch) ? lunch : parseJson(existing.lunch),
        dinner: Array.isArray(dinner) ? dinner : parseJson(existing.dinner),
        snacks: Array.isArray(snacks) ? snacks : parseJson(existing.snacks),
      };

      // Merge new meals with existing, avoiding duplicates
      Object.keys(updatedMeals).forEach((type) => {
        if (Array.isArray(req.body[type]) && req.body[type].length > 0) {
          updatedMeals[type] = [...parseJson(existing[type]), ...req.body[type]].filter(
            (meal, index, self) =>
              index === self.findIndex((m) => m.dish_id === meal.dish_id && m.dish_name === meal.dish_name)
          );
        }
      });

      dietLog = await updateDietLog(existing.log_id, {
        user_id: parsedUserId,
        template_id: existing.template_id,
        log_date: normalizedLogDate,
        breakfast: updatedMeals.breakfast,
        lunch: updatedMeals.lunch,
        dinner: updatedMeals.dinner,
        snacks: updatedMeals.snacks,
        total_calories: calculatedTotals.calories,
        proteins: calculatedTotals.proteins,
        fats: calculatedTotals.fats,
        carbs: calculatedTotals.carbs,
        adherence: existing.adherence,
      });
      console.log("✅ Diet log updated:", JSON.stringify(dietLog, null, 2));
    } else {
      dietLog = await insertDietLog({
        user_id: parsedUserId,
        log_date: normalizedLogDate,
        breakfast: breakfast || [],
        lunch: lunch || [],
        dinner: dinner || [],
        snacks: snacks || [],
        total_calories: calculatedTotals.calories,
        proteins: calculatedTotals.proteins,
        fats: calculatedTotals.fats,
        carbs: calculatedTotals.carbs,
      });
      console.log("✅ Diet log created:", JSON.stringify(dietLog, null, 2));
    }

    await db.query("COMMIT");
    res.status(201).json({ dietLog });
  } catch (err) {
    try {
      await db.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("❌ Rollback failed:", rollbackErr.message);
    }
    console.error("❌ Failed to insert or update diet log:", err.stack);
    res.status(400).json({ error: err.message || "Failed to process diet log" });
  }
};

export const createDishAndLog = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { dish, log } = req.body;

    if (!dish.created_by || !dish.dish_name || !dish.meal_type) {
      throw new Error("Missing required dish fields: created_by, dish_name, meal_type");
    }
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [dish.created_by]);
    if (userCheck.rows.length === 0) {
      throw new Error("Invalid user ID for dish");
    }

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

    const mealField = Object.keys(log).find(
      (key) => ["breakfast", "lunch", "dinner", "snacks"].includes(key)
    );
    if (!mealField || !log[mealField][0]) {
      throw new Error("Invalid meal field in log data");
    }
    log[mealField][0].dish_id = dishResult.dish_id;

    if (!log.user_id || !log.log_date) {
      throw new Error("Missing required log fields: user_id, log_date");
    }
    const parsedLogUserId = parseInt(log.user_id);
    const logUserCheck = await db.query("SELECT id FROM users WHERE id = $1", [parsedLogUserId]);
    if (logUserCheck.rows.length === 0) {
      throw new Error("Invalid user ID for log");
    }

    const normalizedLogDate = log_date.split("T")[0];
    const existingLog = await db.query(
      "SELECT * FROM diet_logs WHERE user_id = $1 AND log_date::date = $2",
      [parsedLogUserId, normalizedLogDate]
    );

    let dietLog;
    if (existingLog.rows.length > 0) {
      const existing = existingLog.rows[0];
      const updatedMeals = {
        breakfast: Array.isArray(log.breakfast) ? log.breakfast : parseJson(existing.breakfast),
        lunch: Array.isArray(log.lunch) ? log.lunch : parseJson(existing.lunch),
        dinner: Array.isArray(log.dinner) ? log.dinner : parseJson(existing.dinner),
        snacks: Array.isArray(log.snacks) ? log.snacks : parseJson(existing.snacks),
      };

      Object.keys(updatedMeals).forEach((type) => {
        if (Array.isArray(log[type]) && log[type].length > 0) {
          updatedMeals[type] = [...parseJson(existing[type]), ...log[type]].filter(
            (meal, index, self) =>
              index === self.findIndex((m) => m.dish_id === meal.dish_id && m.dish_name === meal.dish_name)
          );
        }
      });

      const calculatedTotals = Object.values(updatedMeals).reduce(
        (acc, meals) => {
          if (!meals || !Array.isArray(meals)) return acc;
          return meals.reduce(
            (innerAcc, meal) => ({
              calories: innerAcc.calories + (Number(meal.actual_calories) || 0),
              proteins: innerAcc.proteins + (Number(meal.proteins) || 0),
              carbs: innerAcc.carbs + (Number(meal.carbs) || 0),
              fats: innerAcc.fats + (Number(meal.fats) || 0),
            }),
            acc
          );
        },
        { calories: 0, proteins: 0, carbs: 0, fats: 0 }
      );

      dietLog = await updateDietLog(existing.log_id, {
        user_id: parsedLogUserId,
        template_id: existing.template_id,
        log_date: normalizedLogDate,
        breakfast: updatedMeals.breakfast,
        lunch: updatedMeals.lunch,
        dinner: updatedMeals.dinner,
        snacks: updatedMeals.snacks,
        total_calories: calculatedTotals.calories,
        proteins: calculatedTotals.proteins,
        fats: calculatedTotals.fats,
        carbs: calculatedTotals.carbs,
        adherence: existing.adherence,
      });
      console.log("✅ Diet log updated:", JSON.stringify(dietLog, null, 2));
    } else {
      const calculatedTotals = Object.entries({ breakfast: log.breakfast, lunch: log.lunch, dinner: log.dinner, snacks: log.snacks }).reduce(
        (acc, [_, meals]) => {
          if (!meals || !Array.isArray(meals)) return acc;
          return meals.reduce(
            (innerAcc, meal) => ({
              calories: innerAcc.calories + (Number(meal.actual_calories) || 0),
              proteins: innerAcc.proteins + (Number(meal.proteins) || 0),
              carbs: innerAcc.carbs + (Number(meal.carbs) || 0),
              fats: innerAcc.fats + (Number(meal.fats) || 0),
            }),
            acc
          );
        },
        { calories: 0, proteins: 0, carbs: 0, fats: 0 }
      );

      dietLog = await insertDietLog({
        user_id: parsedLogUserId,
        log_date: normalizedLogDate,
        breakfast: log.breakfast || [],
        lunch: log.lunch || [],
        dinner: log.dinner || [],
        snacks: log.snacks || [],
        total_calories: calculatedTotals.calories,
        proteins: calculatedTotals.proteins,
        fats: calculatedTotals.fats,
        carbs: calculatedTotals.carbs,
      });
      console.log("✅ Diet log created:", JSON.stringify(dietLog, null, 2));
    }

    await db.query("COMMIT");
    res.status(201).json({ dish: dishResult, dietLog });
  } catch (err) {
    try {
      await db.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("❌ Rollback failed:", rollbackErr.message);
    }
    console.error("❌ Transaction Error:", err.stack);
    res.status(400).json({ error: err.message });
  }
};

// Other controller functions
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
    const log = await getDietLogById(parseInt(id));
    if (!log) {
      console.error("❌ Diet log not found for id:", id);
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
      console.error("❌ Invalid user_id:", user_id);
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const parsedUserId = parseInt(user_id);
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [parsedUserId]);
    if (userCheck.rows.length === 0) {
      console.error("❌ User not found for ID:", parsedUserId);
      return res.status(400).json({ error: "User not found" });
    }
    const normalizedLogDate = log_date ? log_date.split("T")[0] : null;
    console.log("🔍 Fetching logs for user:", parsedUserId, "with log_date:", normalizedLogDate);
    const logs = await getDietLogsByUser(parsedUserId, normalizedLogDate);
    res.status(200).json({ logs });
    console.log("✅ Successfully fetched logs:", logs);
  } catch (err) {
    console.error("❌ Failed to get user diet logs:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const editDietLog = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("BEGIN");
    const { breakfast, lunch, dinner, snacks, log_date, total_calories, proteins, carbs, fats } = req.body;

    const mealFields = { breakfast, lunch, dinner, snacks };
    for (const [field, meals] of Object.entries(mealFields)) {
      if (meals && !Array.isArray(meals)) {
        console.error(`❌ Invalid ${field} format:`, meals);
        return res.status(400).json({ error: `Invalid ${field} format, expected array` });
      }
      await validateDishIds(meals, field);
    }

    // Verify totals from payload
    const calculatedTotals = Object.values(mealFields).reduce(
      (acc, meals) => {
        if (!meals || !Array.isArray(meals)) return acc;
        return meals.reduce(
          (innerAcc, meal) => ({
            calories: innerAcc.calories + (Number(meal.actual_calories) || 0),
            proteins: innerAcc.proteins + (Number(meal.proteins) || 0),
            carbs: innerAcc.carbs + (Number(meal.carbs) || 0),
            fats: innerAcc.fats + (Number(meal.fats) || 0),
          }),
          acc
        );
      },
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );

    if (
      total_calories != null &&
      (calculatedTotals.calories !== Number(total_calories) ||
       calculatedTotals.proteins !== Number(proteins) ||
       calculatedTotals.carbs !== Number(carbs) ||
       calculatedTotals.fats !== Number(fats))
    ) {
      console.warn("⚠️ Totals mismatch:", { calculatedTotals, payloadTotals: { total_calories, proteins, carbs, fats } });
    }

    const normalizedLogDate = log_date ? log_date.split("T")[0] : null;
    console.log("🔍 Updating log for id:", id, ", log_date:", normalizedLogDate);

    const existingLog = await db.query("SELECT * FROM diet_logs WHERE log_id = $1", [parseInt(id)]);
    if (existingLog.rows.length === 0) {
      console.error("❌ Diet log not found for id:", id);
      return res.status(404).json({ error: "Diet log not found" });
    }

    const existing = existingLog.rows[0];
    const updatedMeals = {
      breakfast: Array.isArray(breakfast) ? breakfast : parseJson(existing.breakfast),
      lunch: Array.isArray(lunch) ? lunch : parseJson(existing.lunch),
      dinner: Array.isArray(dinner) ? dinner : parseJson(existing.dinner),
      snacks: Array.isArray(snacks) ? snacks : parseJson(existing.snacks),
    };

    const updated = await updateDietLog(parseInt(id), {
      user_id: existing.user_id,
      template_id: existing.template_id,
      log_date: normalizedLogDate || existing.log_date,
      breakfast: updatedMeals.breakfast,
      lunch: updatedMeals.lunch,
      dinner: updatedMeals.dinner,
      snacks: updatedMeals.snacks,
      total_calories: total_calories != null ? calculatedTotals.calories : existing.total_calories,
      proteins: proteins != null ? calculatedTotals.proteins : existing.proteins,
      fats: fats != null ? calculatedTotals.fats : existing.fats,
      carbs: carbs != null ? calculatedTotals.carbs : existing.carbs,
      adherence: existing.adherence,
    });

    if (!updated) {
      console.error("❌ Diet log not found or not updated for id:", id);
      return res.status(404).json({ error: "Diet log not found or not updated" });
    }

    await db.query("COMMIT");
    res.status(200).json({ updated });
    console.log("✅ Successfully updated log:", updated);
  } catch (err) {
    try {
      await db.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("❌ Rollback failed:", rollbackErr.message);
    }
    console.error("❌ Failed to update diet log:", err.stack);
    res.status(400).json({ error: err.message || "Failed to process diet log" });
  }
};

export const removeDietLog = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("🔍 Deleting log id:", id);
    const deleted = await deleteDietLog(parseInt(id));
    if (!deleted) {
      console.error("❌ Diet log not found or already deleted:", id);
      return res.status(404).json({ error: "Diet log not found or already deleted" });
    }
    res.status(200).json({ message: "Diet log deleted successfully" });
    console.log("✅ Successfully deleted diet log:", id);
  } catch (err) {
    console.error("❌ Failed to delete diet log:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
