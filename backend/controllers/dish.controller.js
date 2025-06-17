import {
  insertDishModel,
  getAllDishesModel,
  getDishByIdModel,
  updateDishModel,
  deleteDishModel,
  getDishByUserIdModel,
  deleteAllDishCreatedByUserIdModel,
} from "../model/dish.model.js";
import { insertDietLog } from "../model/diet_log.model.js";
import db from "../config/db.js";

const validateDishIds = async (meals, fieldName, client) => {
  if (!meals || !Array.isArray(meals)) return true;
  try {
    for (const meal of meals) {
      if (!meal.dish_id || isNaN(parseInt(meal.dish_id))) {
        throw new Error(`Missing or invalid dish_id in ${fieldName}`);
      }
      const dishCheck = await client.query(
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

const createDishAndLog = async (req, res) => {
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
    }, db);
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
    const logUserCheck = await db.query("SELECT id FROM users WHERE id = $1", [log.user_id]);
    if (logUserCheck.rows.length === 0) {
      throw new Error("Invalid user ID for log");
    }

    const mealFields = { breakfast: log.breakfast, lunch: log.lunch, dinner: log.dinner, snacks: log.snacks };
    for (const [field, meals] of Object.entries(mealFields)) {
      await validateDishIds(meals, field, db);
    }

    const logResult = await insertDietLog(log, db);
    console.log("✅ Diet log inserted:", logResult);

    await db.query("COMMIT");
    res.status(201).json({ dish: dishResult, dietLog: logResult });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("❌ Transaction Error:", err.stack);
    res.status(400).json({ error: err.message });
  }
};

const createDishController = async (req, res) => {
  const {
    created_by,
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units,
    meal_type,
    is_vegetarian,
    unit_value,
  } = req.body;

  if (!dish_name || !meal_type) {
    return res
      .status(400)
      .json({ error: "dish_name and meal_type are required." });
  }

  try {
    if (created_by) {
      const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
        created_by,
      ]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
    }

    const dish = await insertDishModel({
      created_by,
      dish_name,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carbs: Number(carbs) || 0,
      units,
      meal_type,
      is_vegetarian,
      unit_value: Number(unit_value) || null,
    }, db);
    return res.status(201).json({ dish });
  } catch (err) {
    console.error("❌ Failed to insert dish:", err.stack);
    return res.status(500).json({ error: "Failed to insert dish." });
  }
};

const getAllDishesController = async (req, res) => {
  try {
    const dishes = await getAllDishesModel();
    return res.status(200).json({ dishes });
  } catch (err) {
    console.error("❌ Failed to fetch dishes:", err.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDishByNameController = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Dish name is required" });
  }

  try {
    const result = await db.query(
      "SELECT * FROM diet_dishes WHERE dish_name = $1",
      [name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dish not found" });
    }
    return res.status(200).json({ dish: result.rows[0] });
  } catch (err) {
    console.error("❌ Failed to get dish by name:", err.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDishByIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const dish = await getDishByIdModel(id);
    if (!dish) {
      return res.status(404).json({ error: "Dish not found" });
    }
    return res.status(200).json({ dish });
  } catch (err) {
    console.error("❌ Failed to get dish:", err.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateDishController = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedDish = await updateDishModel(id, {
      ...req.body,
      calories: Number(req.body.calories) || 0,
      protein: Number(req.body.protein) || 0,
      fat: Number(req.body.fat) || 0,
      carbs: Number(req.body.carbs) || 0,
      unit_value: Number(req.body.unit_value) || null,
    });
    if (!updatedDish) {
      return res.status(404).json({ error: "Dish not found or not updated" });
    }
    return res.status(200).json({ dish: updatedDish });
  } catch (err) {
    console.error("❌ Failed to update dish:", err.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteDishController = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDish = await deleteDishModel(id);
    if (!deletedDish) {
      return res
        .status(404)
        .json({ error: "Dish not found or already deleted" });
    }
    return res
      .status(200)
      .json({ message: "Dish deleted successfully", dish: deletedDish });
  } catch (err) {
    console.error("❌ Failed to delete dish:", err.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDishesByUserIdController = async (req, res) => {
  const { userId } = req.params;

  try {
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const dishes = await getDishByUserIdModel(userId);
    if (!dishes || dishes.length === 0) {
      return res.status(404).json({ error: "No dishes found for this user" });
    }
    return res.status(200).json({ dishes: dishes });
  } catch (err) {
    console.error("❌ Failed to get user dishes:", err.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteAllDishesByUserIdController = async (req, res) => {
  const { userId } = req.params;

  try {
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const deletedDishes = await deleteAllDishCreatedByUserIdModel(userId);
    if (!deletedDishes || deletedDishes.length === 0) {
      return res
        .status(404)
        .json({ error: "No dishes found to delete for this user" });
    }
    return res.status(200).json({
      message: "All user-created dishes deleted",
      dishes: deletedDishes,
    });
  } catch (err) {
    console.error("❌ Failed to delete user dishes:", err.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  deleteAllDishesByUserIdController,
  getDishByIdController,
  updateDishController,
  getDishesByUserIdController,
  deleteDishController,
  getAllDishesController,
  createDishController,
  createDishAndLog,
  getDishByNameController,
};
