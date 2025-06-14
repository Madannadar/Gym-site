import { useState, useEffect, useRef } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import { useMeals } from "../context/MealContext";
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

const MealCard = ({ title, meals, summary: initialSummary, dietTargets }) => {
  const { meals: availableMeals, getMealNutrition, mealNutritionData } = useMeals();
  const { uid } = useAuth();
  const [localSelectedMeals, setLocalSelectedMeals] = useState(meals || []);
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  const prevMealsRef = useRef(meals || []);
  const lastSavedMealsRef = useRef(localSelectedMeals);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(
    title === "Today"
      ? [
          { label: "Calories", value: "0 kcal", percent: 0 },
          { label: "Protein", value: "0g", percent: 0 },
          { label: "Carbs", value: "0g", percent: 0 },
          { label: "Fat", value: "0g", percent: 0 },
        ]
      : initialSummary
  );

  useEffect(() => {
    if (title === "Today") {
      console.log("📥 Received meals prop:", meals);
      console.log("📋 Available meals:", availableMeals);
      console.log("🍽️ mealNutritionData:", JSON.stringify(mealNutritionData, null, 2));
      const normalizedMeals = (meals || []).map((meal) => {
        if (!meal.type) return meal;
        const nutrition = getMealNutrition(meal.type, meal.dish_name || meal.meal);
        return {
          ...meal,
          meal: meal.dish_name || meal.meal || null,
          dish_name: meal.dish_name || meal.meal || null,
          dish_id: meal.dish_id || null,
          actual_calories: Number(meal.actual_calories) || Number(nutrition.calories) || 0,
          proteins: Number(meal.proteins) || Number(nutrition.protein) || 0,
          carbs: Number(meal.carbs) || Number(nutrition.carbs) || 0,
          fats: Number(meal.fats) || Number(nutrition.fat) || 0,
          quantity: Number(meal.quantity) || 1,
        };
      });
      setLocalSelectedMeals(normalizedMeals.sort((a, b) => mealTypes.indexOf(a.type) - mealTypes.indexOf(b.type)));
      prevMealsRef.current = meals || [];
    }
  }, [meals, title, availableMeals, getMealNutrition, mealNutritionData]);

  useEffect(() => {
    if (title === "Today") {
      const totals = localSelectedMeals.reduce(
        (acc, meal) => ({
          calories: acc.calories + (Number(meal.actual_calories) || 0),
          protein: acc.protein + (Number(meal.proteins) || 0),
          carbs: acc.carbs + (Number(meal.carbs) || 0),
          fat: acc.fat + (Number(meal.fats) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      console.log("📊 Calculated totals:", totals);

      const caloriesPercent = Math.min(
        Math.round((totals.calories / (dietTargets?.calories || 2400)) * 100),
        100
      );
      const proteinPercent = Math.min(
        Math.round((totals.protein / (dietTargets?.protein || 165)) * 100),
        100
      );
      const carbsPercent = Math.min(
        Math.round((totals.carbs / (dietTargets?.carbs || 275)) * 100),
        100
      );
      const fatPercent = Math.min(
        Math.round((totals.fat / (dietTargets?.fat || 100)) * 100),
        100
      );

      setSummary([
        { label: "Calories", value: `${totals.calories} kcal`, percent: caloriesPercent },
        { label: "Protein", value: `${totals.protein}g`, percent: proteinPercent },
        { label: "Carbs", value: `${totals.carbs}g`, percent: carbsPercent },
        { label: "Fat", value: `${totals.fat}g`, percent: fatPercent },
      ]);
    }
  }, [localSelectedMeals, title, dietTargets]);

  const handleMealTypeSelect = (e) => {
    const type = e.target.value;
    if (type) {
      setLocalSelectedMeals((prev) => {
        if (prev.some((meal) => meal.type === type)) return prev;
        const updated = [
          ...prev,
          { type, meal: null, dish_name: null, dish_id: null, actual_calories: 0, proteins: 0, carbs: 0, fats: 0, quantity: 1 },
        ];
        return updated.sort((a, b) => mealTypes.indexOf(a.type) - mealTypes.indexOf(b.type));
      });
      setShowMealTypeDropdown(false);
    }
  };

  const handleMealSelect = (index, meal) => {
    console.log(`🖱️ Selecting meal at index ${index}:`, meal);
    try {
      setLocalSelectedMeals((prev) => {
        const updatedMeals = [...prev];
        if (!meal) {
          updatedMeals[index] = {
            ...updatedMeals[index],
            meal: null,
            dish_name: null,
            dish_id: null,
            actual_calories: 0,
            proteins: 0,
            carbs: 0,
            fats: 0,
            quantity: 1,
          };
        } else {
          const nutrition = getMealNutrition(updatedMeals[index].type, meal);
          console.log("🍽️ Nutrition for", meal, ":", nutrition);
          const dishId = mealNutritionData[updatedMeals[index].type]?.[meal]?.id || null;
          console.log("🔍 Dish ID for", meal, ":", dishId);
          updatedMeals[index] = {
            type: updatedMeals[index].type,
            meal,
            dish_name: meal,
            dish_id: dishId,
            actual_calories: Number(nutrition.calories) || 0,
            proteins: Number(nutrition.protein) || 0,
            carbs: Number(nutrition.carbs) || 0,
            fats: Number(nutrition.fat) || 0,
            quantity: Number(nutrition.unit_value) || 1,
          };
        }
        console.log("🔍 Updated meals:", JSON.stringify(updatedMeals, null, 2));
        return updatedMeals.sort((a, b) => mealTypes.indexOf(a.type) - mealTypes.indexOf(b.type));
      });
    } catch (err) {
      console.error("❌ Error in handleMealSelect:", err);
      setError(`Failed to select meal: ${meal}. Please try again.`);
    }
  };

  useEffect(() => {
    const saveMealToBackend = async () => {
      if (!uid || isNaN(parseInt(uid))) {
        console.error("❌ Invalid user_id:", uid);
        setError("Invalid user ID. Please log in again.");
        return;
      }

      try {
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        console.log("🔍 Today's date:", today);
        const totals = localSelectedMeals.reduce(
          (acc, m) => ({
            calories: acc.calories + (Number(m.actual_calories) || 0),
            proteins: acc.proteins + (Number(m.proteins) || 0),
            carbs: acc.carbs + (Number(m.carbs) || 0),
            fats: acc.fats + (Number(m.fats) || 0),
          }),
          { calories: 0, proteins: 0, carbs: 0, fats: 0 }
        );
        console.log("🔍 Calculated totals for log:", totals);

        const logData = {
          user_id: parseInt(uid),
          log_date: today,
          total_calories: totals.calories,
          proteins: totals.proteins,
          carbs: totals.carbs,
          fats: totals.fats,
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        };

        console.log("🔍 Local meals before grouping:", JSON.stringify(localSelectedMeals, null, 2));
        localSelectedMeals.forEach((meal) => {
          if (meal.meal && meal.dish_id) {
            const mealData = {
              dish_id: meal.dish_id,
              dish_name: meal.dish_name,
              actual_calories: Number(meal.actual_calories) || 0,
              proteins: Number(meal.proteins) || 0,
              carbs: Number(meal.carbs) || 0,
              fats: Number(meal.fats) || 0,
              quantity: Number(meal.quantity) || 1,
            };
            const typeKey = meal.type.toLowerCase();
            logData[typeKey].push(mealData);
          }
        });

        console.log("📤 Sending diet log:", JSON.stringify(logData, null, 2));
        const response = await apiClient.post("/diet-logs", logData);
        console.log("✅ Diet log saved:", JSON.stringify(response.data, null, 2));

        const refreshResponse = await apiClient.get(`/diet-logs/user/${uid}?log_date=${today}`);
        console.log("🔍 Refreshed meals:", JSON.stringify(refreshResponse.data, null, 2));
        const logs = refreshResponse.data.logs || [];
        const refreshedMeals = logs.flatMap((log) =>
          ["breakfast", "lunch", "dinner", "snacks"].flatMap((type) => {
            if (!log[type] || !Array.isArray(log[type])) return [];
            return log[type].map((item) => ({
              type: type.charAt(0).toUpperCase() + type.slice(1),
              meal: item.dish_name,
              dish_name: item.dish_name,
              dish_id: item.dish_id,
              actual_calories: Number(item.actual_calories) || 0,
              proteins: Number(item.proteins) || 0,
              carbs: Number(item.carbs) || 0,
              fats: Number(item.fats) || 0,
              quantity: Number(item.quantity) || 1,
            }));
          })
        );

        if (refreshedMeals.length === 0) {
          console.warn("⚠️ No meals returned from backend, retaining localSelectedMeals");
          lastSavedMealsRef.current = localSelectedMeals;
        } else {
          const isDifferent = refreshedMeals.some((rm, i) => {
            const lm = localSelectedMeals[i] || {};
            return (
              rm.type !== lm.type ||
              rm.meal !== lm.meal ||
              rm.dish_id !== lm.dish_id ||
              rm.actual_calories !== lm.actual_calories ||
              rm.proteins !== lm.proteins ||
              rm.carbs !== lm.carbs ||
              rm.fats !== lm.fats ||
              rm.quantity !== lm.quantity
            );
          }) || refreshedMeals.length !== localSelectedMeals.length;

          if (isDifferent) {
            console.log("🔄 Updating localSelectedMeals with refreshed meals");
            setLocalSelectedMeals(refreshedMeals.sort((a, b) => mealTypes.indexOf(a.type) - mealTypes.indexOf(b.type)));
            lastSavedMealsRef.current = refreshedMeals;
          } else {
            console.log("🔄 No changes in refreshed meals, skipping update");
            lastSavedMealsRef.current = localSelectedMeals;
          }
        }
      } catch (err) {
        console.error("❌ Error saving diet log:", err.response?.data || err.message);
        setError("Failed to save meal log. Please try again.");
      }
    };

    const hasNewMeal = localSelectedMeals.some((meal, i) => {
      const lastMeal = lastSavedMealsRef.current[i] || {};
      return (
        meal.meal &&
        meal.dish_id &&
        (meal.meal !== lastMeal.meal ||
         meal.dish_id !== lastMeal.dish_id ||
         meal.actual_calories !== lastMeal.actual_calories ||
         meal.quantity !== lastMeal.quantity)
      );
    });

    if (hasNewMeal) {
      console.log("🔄 Detected new meal, saving to backend");
      saveMealToBackend();
    } else {
      console.log("🔄 No new meals to save");
    }
  }, [localSelectedMeals, uid]);

  const hasAllMealTypes = localSelectedMeals.length >= mealTypes.length &&
    mealTypes.every((type) => localSelectedMeals.some((meal) => meal.type === type));

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong>Error:</strong> {error}
        <button
          className="ml-4 text-red-700 underline"
          onClick={() => setError(null)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-5 mb-5 border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h3>

      <div className="mt-4 space-y-4">
        {localSelectedMeals.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-700">{entry.type}:</span>
              {title === "Today" ? (
                entry.meal === null ? (
                  <select
                    className="border border-gray-300 p-2 rounded-md text-gray-700"
                    value={entry.meal || ""}
                    onChange={(e) => handleMealSelect(index, e.target.value)}
                  >
                    <option value="">Select {entry.type} Meal</option>
                    {Array.isArray(availableMeals[entry.type]) &&
                      availableMeals[entry.type].map((meal, i) => (
                        <option key={i} value={meal}>
                          {meal}
                        </option>
                      ))}
                  </select>
                ) : (
                  <span className="text-gray-600">{entry.dish_name || "Unknown"}</span>
                )
              ) : (
                <span className="text-gray-600">{entry.description}</span>
              )}
            </div>
            {title === "Today" && entry.meal !== null && (
              <button
                onClick={() => handleMealSelect(index, null)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Edit meal"
              >
                <FaPencilAlt className="text-sm" />
              </button>
            )}
          </div>
        ))}

        {title === "Today" && !hasAllMealTypes && !showMealTypeDropdown && (
          <button
            className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer"
            onClick={() => setShowMealTypeDropdown(true)}
          >
            <FaPlus className="text-gray-600" />
            <span>Add Meal</span>
          </button>
        )}

        {showMealTypeDropdown && title === "Today" && (
          <div className="flex items-center gap-3">
            <select
              className="border border-gray-300 p-2 rounded-md text-gray-700"
              value=""
              onChange={handleMealTypeSelect}
            >
              <option value="">Select Meal Type</option>
              {mealTypes
                .filter((type) => !localSelectedMeals.some((entry) => entry.type === type))
                .map((type, i) => (
                  <option key={i} value={type}>
                    {type}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-md sm:text-lg font-semibold text-gray-800">Nutritional Summary</h3>
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          {summary.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline"
            >
              <div className="flex items-center gap-2 w-full sm:w-3/5">
                <span className="text-sm sm:text-base text-gray-800">{item.label}</span>
                <span className="font-semibold text-xs sm:text-sm text-gray-700">
                  {item.value}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm">({item.percent}%)</span>
              </div>
              <div className="w-full sm:w-2/5 mt-2 sm:mt-0">
                <div className="w-full h-2 bg-gray-300 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor:
                        item.label === "Calories"
                          ? "#4B9CD3"
                          : item.label === "Protein"
                          ? "#6C63FF"
                          : item.label === "Carbs"
                          ? "#FF6F61"
                          : "#FFC107",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealCard;
