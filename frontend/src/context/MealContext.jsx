import { createContext, useContext, useState, useEffect, useRef } from "react";
import { apiClient } from "../AxiosSetup";

const MealContext = createContext();

export { MealContext };

export const useMeals = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error("useMeals must be used within a MealProvider");
  }
  return context;
};

export const MealProvider = ({ children }) => {
  const [availableMeals, setAvailableMeals] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: [],
  });
  const [mealNutritionData, setMealNutritionData] = useState({
    Breakfast: {},
    Lunch: {},
    Dinner: {},
    Snacks: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchMeals = async () => {
    if (hasFetched.current) {
      console.log("⏩ Skipping fetchMeals, data already fetched");
      return;
    }
    try {
      setIsLoading(true);
      console.log("🔍 Fetching dishes from:", apiClient.defaults.baseURL + "/dishes");
      const response = await apiClient.get("/dishes");
      console.log("Dishes response:", response.data);
      const dishes = response.data.dishes || [];

      const newMeals = {
        Breakfast: [],
        Lunch: [],
        Dinner: [],
        Snacks: [],
      };
      const newNutrition = {
        Breakfast: {},
        Lunch: {},
        Dinner: {},
        Snacks: {},
      };

      dishes.forEach((dish) => {
        if (!dish.meal_type) {
          console.log(`⚠️ Skipping dish ${dish.dish_name} with null meal_type`);
          return;
        }
        const mealType =
          dish.meal_type.charAt(0).toUpperCase() + dish.meal_type.slice(1);
        if (newMeals[mealType]) {
          newMeals[mealType].push(dish.dish_name);
          newNutrition[mealType][dish.dish_name] = {
            id: dish.dish_id,
            name: dish.dish_name,
            calories: dish.calories || 0,
            protein: dish.protein || 0,
            carbs: dish.carbs || 0,
            fat: dish.fat || 0,
            is_vegetarian: dish.is_vegetarian || false,
            units: dish.units || [],
            unit_value: dish.unit_value || 0,
          };
        }
      });

      setAvailableMeals(newMeals);
      setMealNutritionData(newNutrition);
      hasFetched.current = true;
    } catch (err) {
      console.error("Error fetching meals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const addMeal = async () => {
    hasFetched.current = false; // Allow re-fetch after adding a meal
    await fetchMeals();
  };

  const getMealNutrition = (mealType, mealName) => {
    return (
      mealNutritionData[mealType]?.[mealName] || {
        id: null,
        name: null,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        is_vegetarian: false,
        units: [],
        unit_value: 0,
      }
    );
  };

  return <MealContext.Provider value={{ meals: availableMeals, addMeal, getMealNutrition, mealNutritionData, isLoading }}>
    {children}
  </MealContext.Provider>;
};
