import * as FoodModel from '../models/Food.js';

export const createFood = async (req, res) => {
  try {
    const newFood = await FoodModel.createFood(req.body);
    res.status(201).json(newFood);
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({ 
      message: 'Failed to create food item', 
      error: error.message 
    });
  }
};

export const getAllFoods = async (req, res) => {
  try {
    const foods = await FoodModel.getAllFoods();
    res.status(200).json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve food items', 
      error: error.message 
    });
  }
};

export const getFoodById = async (req, res) => {
  try {
    const food = await FoodModel.getFoodById(req.params.id);
    res.status(200).json(food);
  } catch (error) {
    if (error.message === 'Food not found') {
      return res.status(404).json({ 
        message: 'Food not found', 
        error: error.message 
      });
    }
    console.error('Error fetching food:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve food item', 
      error: error.message 
    });
  }
};

export const updateFood = async (req, res) => {
  try {
    const updatedFood = await FoodModel.updateFood(req.params.id, req.body);
    res.status(200).json(updatedFood);
  } catch (error) {
    if (error.message === 'Food not found') {
      return res.status(404).json({ 
        message: 'Food not found', 
        error: error.message 
      });
    }
    console.error('Error updating food:', error);
    res.status(500).json({ 
      message: 'Failed to update food item', 
      error: error.message 
    });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const deletedFood = await FoodModel.deleteFood(req.params.id);
    res.status(200).json({ 
      message: 'Food item deleted successfully', 
      deletedFood 
    });
  } catch (error) {
    if (error.message === 'Food not found') {
      return res.status(404).json({ 
        message: 'Food not found', 
        error: error.message 
      });
    }
    console.error('Error deleting food:', error);
    res.status(500).json({ 
      message: 'Failed to delete food item', 
      error: error.message 
    });
  }
};