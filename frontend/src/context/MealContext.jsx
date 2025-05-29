import { createContext, useContext, useState, useEffect } from "react";

// Create context
const MealContext = createContext();

// Custom hook for consuming the context
export const useMeals = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error("useMeals must be used within a MealProvider");
  }
  return context;
};

// Provider component
export const MealProvider = ({ children }) => {
  // Available meals by type
  const [availableMeals, setAvailableMeals] = useState({
    Breakfast: [
      "Oatmeal with berries",
      "Eggs and whole grain toast",
      "Protein pancakes",
      "Greek yogurt parfait"
    ],
    Lunch: [
      "Grilled chicken salad",
      "Quinoa bowl with vegetables", 
      "Turkey sandwich",
      "Tuna wrap"
    ],
    Dinner: [
      "Salmon with roasted vegetables",
      "Stir fry with brown rice",
      "Grilled steak with sweet potato",
      "Pasta with tomato sauce"
    ],
    Snacks: [
      "Greek yogurt, apple",
      "Protein shake, nuts",
      "Hummus with veggies",
      "Energy bar"
    ]
  });

  // Store nutritional information for meals
  const [mealNutritionData, setMealNutritionData] = useState({
    Breakfast: {
      "Oatmeal with berries": { calories: 350, protein: 10, carbs: 60, fat: 7 },
      "Eggs and whole grain toast": { calories: 400, protein: 20, carbs: 30, fat: 15 },
      "Protein pancakes": { calories: 450, protein: 25, carbs: 40, fat: 12 },
      "Greek yogurt parfait": { calories: 300, protein: 18, carbs: 35, fat: 8 }
    },
    Lunch: {
      "Grilled chicken salad": { calories: 450, protein: 35, carbs: 20, fat: 15 },
      "Quinoa bowl with vegetables": { calories: 500, protein: 15, carbs: 70, fat: 12 },
      "Turkey sandwich": { calories: 550, protein: 30, carbs: 50, fat: 18 },
      "Tuna wrap": { calories: 400, protein: 28, carbs: 35, fat: 12 }
    },
    Dinner: {
      "Salmon with roasted vegetables": { calories: 550, protein: 40, carbs: 30, fat: 20 },
      "Stir fry with brown rice": { calories: 600, protein: 25, carbs: 75, fat: 15 },
      "Grilled steak with sweet potato": { calories: 650, protein: 45, carbs: 40, fat: 25 },
      "Pasta with tomato sauce": { calories: 550, protein: 18, carbs: 85, fat: 10 }
    },
    Snacks: {
      "Greek yogurt, apple": { calories: 200, protein: 12, carbs: 25, fat: 3 },
      "Protein shake, nuts": { calories: 250, protein: 20, carbs: 15, fat: 10 },
      "Hummus with veggies": { calories: 180, protein: 8, carbs: 20, fat: 8 },
      "Energy bar": { calories: 220, protein: 10, carbs: 28, fat: 7 }
    }
  });

  // Debug logging for state changes
  useEffect(() => {
    console.log("MealContext - availableMeals updated:", availableMeals);
  }, [availableMeals]);

  // Function to add a new meal
  const addMeal = (mealType, mealName, nutrition) => {
    console.log(`Adding meal: ${mealName} to ${mealType}`, nutrition);

    // Update available meals list - create a completely new object reference
    setAvailableMeals(prevMeals => {
      // Make a deep copy
      const updatedMeals = JSON.parse(JSON.stringify(prevMeals));
      
      // Only add if it doesn't already exist
      if (!updatedMeals[mealType].includes(mealName)) {
        updatedMeals[mealType] = [...updatedMeals[mealType], mealName];
      }
      
      console.log("Updated meals:", updatedMeals);
      return updatedMeals;
    });
    
    // Update nutrition data
    setMealNutritionData(prevData => {
      // Make a deep copy
      const updatedData = JSON.parse(JSON.stringify(prevData));
      
      if (!updatedData[mealType]) {
        updatedData[mealType] = {};
      }
      
      updatedData[mealType][mealName] = {
        calories: parseInt(nutrition.calories),
        protein: parseInt(nutrition.protein),
        carbs: parseInt(nutrition.carbs),
        fat: parseInt(nutrition.fats)
      };
      
      return updatedData;
    });
  };

  // Get nutritional data for a specific meal
  const getMealNutrition = (mealType, mealName) => {
    return mealNutritionData[mealType]?.[mealName] || 
      { calories: 0, protein: 0, carbs: 0, fat: 0 };
  };

  // Provide the context value
  const value = {
    meals: availableMeals,
    addMeal,
    getMealNutrition,
    mealNutritionData
  };

  return <MealContext.Provider value={value}>{children}</MealContext.Provider>;
};
