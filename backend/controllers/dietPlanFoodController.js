import {
    addFoodToDietPlan as addFoodToDietPlanModel,
    getFoodsByDietPlanId as getFoodsByDietPlanIdModel,
    removeFoodFromDietPlan as removeFoodFromDietPlanModel,
    updateDietPlanFood as updateDietPlanFoodModel
} from '../models/DietPlan_Food.js'

export const addFoodToDietPlan = async (req, res) => {
    try {
        const { diet_plan_id } = req.params;
        const { food_id, portion_size, meal_type } = req.body;

        const newDietPlanFood = await addFoodToDietPlanModel({
            diet_plan_id,
            food_id,
            portion_size,
            meal_type
        });

        res.status(201).json(newDietPlanFood);
    } catch (error) {
        console.error('Error adding food to diet plan:', error);
        res.status(500).json({
            message: 'Failed to add food to diet plan',
            error: error.message
        });
    }
};

export const getFoodsByDietPlanId = async (req, res) => {
    try {
        const { diet_plan_id } = req.params;
        const foods = await getFoodsByDietPlanIdModel(diet_plan_id);

        res.status(200).json(foods);
    } catch (error) {
        console.error('Error fetching foods in diet plan:', error);
        res.status(500).json({
            message: 'Failed to retrieve foods in diet plan',
            error: error.message
        });
    }
};

export const removeFoodFromDietPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const removedFood = await removeFoodFromDietPlanModel(id);

        res.status(200).json({
            message: 'Food removed from diet plan successfully',
            removedFood
        });
    } catch (error) {
        if (error.message === 'Diet plan food not found') {
            return res.status(404).json({
                message: 'Diet plan food not found',
                error: error.message
            });
        }
        console.error('Error removing food from diet plan:', error);
        res.status(500).json({
            message: 'Failed to remove food from diet plan',
            error: error.message
        });
    }
};

export const updateDietPlanFood = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedDietPlanFood = await updateDietPlanFoodModel(id, req.body);

        res.status(200).json(updatedDietPlanFood);
    } catch (error) {
        if (error.message === 'Diet plan food not found') {
            return res.status(404).json({
                message: 'Diet plan food not found',
                error: error.message
            });
        }
        console.error('Error updating diet plan food:', error);
        res.status(500).json({
            message: 'Failed to update diet plan food',
            error: error.message
        });
    }
};