import {
  insertDishModel,
  getAllDishesModel,
  getDishByIdModel,
  updateDishModel,
  deleteDishModel,
  getDishByUserIdModel,
  deleteAllDishCreatedByUserIdModel,
} from "../model/dish.model.js";

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
  } = req.body;

  if (!dish_name || !meal_type) {
    return res
      .status(400)
      .json({ error: "dish_name and meal_type are required." });
  }

  try {
    const dish = await insertDishModel({
      created_by,
      dish_name,
      calories,
      protein,
      fat,
      carbs,
      units,
      meal_type,
      is_vegetarian,
    });
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
    const updatedDish = await updateDishModel(id, req.body);
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
    const dishes = await getDishByUserIdModel(userId);
    if (!dishes || dishes.length === 0) {
      return res.status(404).json({ error: "No dishes found for this user" });
    }
    return res.status(200).json({ dishes });
  } catch (err) {
    console.error("❌ Failed to get user dishes:", err.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteAllDishesByUserIdController = async (req, res) => {
  const { userId } = req.params;

  try {
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
};
