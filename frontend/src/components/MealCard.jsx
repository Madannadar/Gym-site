import { useState, useEffect, useRef } from "react";
import { FaPlus, FaPencilAlt, FaTimes } from "react-icons/fa";
import { useMeals } from "../context/MealContext";
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

const MealCard = ({ title, meals, summary: initialSummary, dietTargets }) => {
  const { meals: availableMeals, getMealNutrition, mealNutritionData } = useMeals();
  const { uid } = useAuth();
  const [localSelectedMeals, setLocalSelectedMeals] = useState(meals || []);
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const [editingMealType, setEditingMealType] = useState(null);
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
      : initialSummary || []
  );

  // Group meals by type for rendering
  const mealsByType = mealTypes.reduce((acc, type) => {
    acc[type] = localSelectedMeals.filter((meal) => meal.type === type);
    return acc;
  }, {});

  useEffect(() => {
    if (title === "Today") {
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
    } else {
      setLocalSelectedMeals(meals || []);
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
        if (prev.some((meal) => meal.type === type && !meal.dish_name)) return prev;
        const updated = [
          ...prev,
          { type, meal: null, dish_name: null, dish_id: null, actual_calories: 0, proteins: 0, carbs: 0, fats: 0, quantity: 1 },
        ];
        return updated.sort((a, b) => mealTypes.indexOf(a.type) - mealTypes.indexOf(b.type));
      });
      setShowMealTypeDropdown(false);
    }
  };

  const handleMealSelect = (type, meal) => {
    try {
      setLocalSelectedMeals((prev) => {
        const updatedMeals = [...prev];
        const nutrition = getMealNutrition(type, meal);
        const dishId = mealNutritionData[type]?.[meal]?.id || null;
        updatedMeals.push({
          type,
          meal,
          dish_name: meal,
          dish_id: dishId,
          actual_calories: Number(nutrition.calories) || 0,
          proteins: Number(nutrition.protein) || 0,
          carbs: Number(nutrition.carbs) || 0,
          fats: Number(nutrition.fat) || 0,
          quantity: Number(nutrition.unit_value) || 1,
        });
        return updatedMeals.sort((a, b) => mealTypes.indexOf(a.type) - mealTypes.indexOf(b.type));
      });
      setEditingMealType(null);
    } catch (err) {
      console.error("❌ Error in handleMealSelect:", err);
      setError(`Failed to select meal: ${meal}. Please try again.`);
    }
  };

  const handleRemoveDish = async (type, dishName) => {
    try {
      setLocalSelectedMeals((prev) => prev.filter((meal) => !(meal.type === type && meal.dish_name === dishName)));
      if (title === "Today") {
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        const response = await apiClient.get(`/diet-logs/user/${uid}?log_date=${today}`);
        const logs = response.data.logs || [];
        if (logs.length > 0) {
          const log = logs[0];
          const updatedMeals = {
            breakfast: log.breakfast || [],
            lunch: log.lunch || [],
            dinner: log.dinner || [],
            snacks: log.snacks || [],
          };
          updatedMeals[type.toLowerCase()] = updatedMeals[type.toLowerCase()].filter(
            (item) => item.dish_name !== dishName
          );

          const totals = Object.values(updatedMeals).reduce(
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

          await apiClient.put(`/diet-logs/${log.log_id}`, {
            log_date: today,
            breakfast: updatedMeals.breakfast,
            lunch: updatedMeals.lunch,
            dinner: updatedMeals.dinner,
            snacks: updatedMeals.snacks,
            total_calories: totals.calories,
            proteins: totals.proteins,
            carbs: totals.carbs,
            fats: totals.fats,
          });
        }
      }
    } catch (err) {
      console.error("❌ Error removing dish:", err);
      setError(`Failed to remove ${dishName}. Please try again.`);
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
        const totals = localSelectedMeals.reduce(
          (acc, m) => ({
            calories: acc.calories + (Number(m.actual_calories) || 0),
            proteins: acc.proteins + (Number(m.proteins) || 0),
            carbs: acc.carbs + (Number(m.carbs) || 0),
            fats: acc.fats + (Number(m.fats) || 0),
          }),
          { calories: 0, proteins: 0, carbs: 0, fats: 0 }
        );

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

        localSelectedMeals.forEach((meal) => {
          if (meal.dish_name && meal.dish_id) {
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

        const response = await apiClient.post("/diet-logs", logData);
        const refreshResponse = await apiClient.get(`/diet-logs/user/${uid}?log_date=${today}`);
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
          lastSavedMealsRef.current = localSelectedMeals;
        } else {
          const isDifferent = refreshedMeals.some((rm, i) => {
            const lm = localSelectedMeals[i] || {};
            return (
              rm.type !== lm.type ||
              rm.dish_name !== lm.dish_name ||
              rm.dish_id !== lm.dish_id ||
              rm.actual_calories !== lm.actual_calories ||
              rm.proteins !== lm.proteins ||
              rm.carbs !== lm.carbs ||
              rm.fats !== lm.fats ||
              rm.quantity !== lm.quantity
            );
          }) || refreshedMeals.length !== localSelectedMeals.length;

          if (isDifferent) {
            setLocalSelectedMeals(refreshedMeals.sort((a, b) => mealTypes.indexOf(a.type) - mealTypes.indexOf(b.type)));
            lastSavedMealsRef.current = refreshedMeals;
          } else {
            lastSavedMealsRef.current = localSelectedMeals;
          }
        }
      } catch (err) {
        console.error("❌ Error saving diet log:", err.response?.data || err.message);
        setError("Failed to save meal log. Please try again.");
      }
    };

    if (title === "Today") {
      const hasNewMeal = localSelectedMeals.some((meal, i) => {
        const lastMeal = lastSavedMealsRef.current[i] || {};
        return (
          meal.dish_name &&
          meal.dish_id &&
          (meal.dish_name !== lastMeal.dish_name ||
           meal.dish_id !== lastMeal.dish_id ||
           meal.actual_calories !== lastMeal.actual_calories ||
           meal.quantity !== lastMeal.quantity)
        );
      });

      if (hasNewMeal) {
        saveMealToBackend();
      }
    }
  }, [localSelectedMeals, uid, title]);

  const hasAllMealTypes = mealTypes.every((type) => localSelectedMeals.some((meal) => meal.type === type));

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

      <div className="mt-4 space-y-6">
        {mealTypes.map((type) => (
          <div key={type} className="grid grid-cols-[100px_1fr_40px] items-start gap-4 py-2">
            <span className="text-lg font-semibold text-gray-700 self-start">{type}</span>
            <div className="flex flex-col gap-2 self-start min-h-0">
              {mealsByType[type].length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mealsByType[type].map((meal, index) => (
                    <div
                      key={index}
                      className="relative bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full flex items-center"
                    >
                      <span>{title === "Today" ? meal.dish_name : meal.dish_name || meal.description}</span>
                      {title === "Today" && (
                        <button
                          onClick={() => handleRemoveDish(type, meal.dish_name)}
                          className="absolute -top-1 -right-1 text-red-500 hover:text-red-700"
                          title="Remove dish"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-600">No dishes logged</span>
              )}
              {title === "Today" && editingMealType === type && (
                <select
                  className="border border-gray-300 p-2 rounded-md text-gray-700 w-full max-w-xs mt-2"
                  value=""
                  onChange={(e) => handleMealSelect(type, e.target.value)}
                >
                  <option value="">Select {type} Dish</option>
                  {Array.isArray(availableMeals[type]) &&
                    availableMeals[type].map((meal, i) => (
                      <option key={i} value={meal}>
                        {meal}
                      </option>
                    ))}
                </select>
              )}
            </div>
            {title === "Today" && (
              <button
                onClick={() => setEditingMealType(editingMealType === type ? null : type)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 self-start"
                title="Add or edit dish"
              >
                <FaPencilAlt className="text-sm" />
              </button>
            )}
          </div>
        ))}

        {title === "Today" && !hasAllMealTypes && !showMealTypeDropdown && (
          <button
            className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer mt-4"
            onClick={() => setShowMealTypeDropdown(true)}
          >
            <FaPlus className="text-gray-600" />
            <span>Add Meal Type</span>
          </button>
        )}

        {showMealTypeDropdown && title === "Today" && (
          <div className="flex items-center gap-3 mt-4">
            <select
              className="border border-gray-300 p-2 rounded-md text-gray-700 w-full max-w-xs"
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
          {summary.length === 0 ? (
            <p className="text-gray-600">No nutritional data available</p>
          ) : (
            summary.map((item, index) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MealCard;
