import { useState, useEffect, useRef } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa"; // Import FaPencilAlt for edit button
import { useMeals } from "../context/MealContext";

// Daily recommended values (for percentage calculations)
const dailyRecommended = {
  calories: 2400,
  protein: 165, // grams
  carbs: 275, // grams
  fat: 100 // grams
};

const MealCard = ({ title, meals, summary: initialSummary, setSelectedMeals }) => {
  // Get context data
  const { meals: availableMeals, getMealNutrition, mealNutritionData } = useMeals();

  // Use a ref to track if this is first render
  const isInitialMount = useRef(true);

  const [localSelectedMeals, setLocalSelectedMeals] = useState(
    title === "Today" ? meals : meals
  ); // Use passed meals prop

  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  // Dynamic summary state
  const [summary, setSummary] = useState(
    title === "Today"
      ? [
          { label: "Calories", value: "0 kcal", percent: 0 },
          { label: "Protein", value: "0g", percent: 0 },
          { label: "Carbs", value: "0g", percent: 0 },
          { label: "Fat", value: "0g", percent: 0 }
        ]
      : initialSummary
  );

  // Sync local state with prop and update parent when changed
  useEffect(() => {
    if (title === "Today") {
      setLocalSelectedMeals(meals);
    }
  }, [meals, title]);

  // Update parent state when local state changes (for Today only)
  useEffect(() => {
    if (title === "Today" && setSelectedMeals) {
      setSelectedMeals(localSelectedMeals);
    }
  }, [localSelectedMeals, title, setSelectedMeals]);

  // Calculate nutritional summary whenever selected meals change
  useEffect(() => {
    if (title === "Today") {
      // Initialize totals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      // Sum up nutrition from all selected meals
      localSelectedMeals.forEach((entry) => {
        if (entry.meal && mealNutritionData[entry.type]?.[entry.meal]) {
          const nutrition = mealNutritionData[entry.type][entry.meal];
          totalCalories += nutrition.calories;
          totalProtein += nutrition.protein;
          totalCarbs += nutrition.carbs;
          totalFat += nutrition.fat;
        }
      });

      // Calculate percentages based on daily recommended values
      const caloriesPercent = Math.min(
        Math.round((totalCalories / dailyRecommended.calories) * 100),
        100
      );
      const proteinPercent = Math.min(
        Math.round((totalProtein / dailyRecommended.protein) * 100),
        100
      );
      const carbsPercent = Math.min(
        Math.round((totalCarbs / dailyRecommended.carbs) * 100),
        100
      );
      const fatPercent = Math.min(
        Math.round((totalFat / dailyRecommended.fat) * 100),
        100
      );

      // Update summary
      setSummary([
        { label: "Calories", value: `${totalCalories} kcal`, percent: caloriesPercent },
        { label: "Protein", value: `${totalProtein}g`, percent: proteinPercent },
        { label: "Carbs", value: `${totalCarbs}g`, percent: carbsPercent },
        { label: "Fat", value: `${totalFat}g`, percent: fatPercent }
      ]);
    }
  }, [localSelectedMeals, title, mealNutritionData]);

  const handleMealTypeSelect = (type) => {
    setLocalSelectedMeals((prev) => [...prev, { type, meal: null }]);
    setShowMealTypeDropdown(false);
  };

  const handleMealSelect = (index, meal) => {
    setLocalSelectedMeals((prev) => {
      const updatedMeals = [...prev];
      updatedMeals[index].meal = meal;
      return updatedMeals;
    });
  };

  // Force re-render of dropdowns when available meals change
  const [dropdownKey, setDropdownKey] = useState(0);

  useEffect(() => {
    if (!isInitialMount.current) {
      setDropdownKey((prevKey) => prevKey + 1);
    } else {
      isInitialMount.current = false;
    }
  }, [availableMeals]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-5 mb-5 border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out">
      {/* Title Section */}
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h3>

      {/* Meal Selection */}
      <div className="mt-4 space-y-4">
        {localSelectedMeals.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-700">{entry.type}:</span>
              {title === "Today" ? (
                entry.meal === null ? (
                  <select
                    key={`${entry.type}-${dropdownKey}`}
                    className="border border-gray-300 p-2 rounded-md text-gray-700"
                    onChange={(e) => handleMealSelect(index, e.target.value)}
                    value=""
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
                  <span className="text-gray-600">{entry.meal}</span>
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

        {title === "Today" &&
          localSelectedMeals.length < mealTypes.length &&
          localSelectedMeals.every((entry) => entry.meal !== null) &&
          !showMealTypeDropdown && (
            <button
              className="flex items-center gap-2 text-gray-700 font-semibold cursor-pointer"
              onClick={() => setShowMealTypeDropdown(true)}
            >
              <FaPlus className="text-gray-700" />
              <span>Add Meal</span>
            </button>
          )}

        {showMealTypeDropdown && title === "Today" && (
          <div className="flex items-center gap-3">
            <select
              key={`mealtype-${dropdownKey}`}
              className="border border-gray-300 p-2 rounded-md text-gray-700"
              onChange={(e) => {
                if (e.target.value) {
                  handleMealTypeSelect(e.target.value);
                }
              }}
              value=""
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

      {/* Nutritional Summary */}
      <div className="mt-6 text-center">
        <h3 className="text-md sm:text-lg font-semibold text-gray-800">
          Nutritional Summary
        </h3>
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          {summary.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline"
            >
              <div className="flex items-center gap-2 w-full sm:w-3/5">
                <span className="text-sm sm:text-base text-gray-800">
                  {item.label}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-gray-700">
                  {item.value}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm">
                  ({item.percent}%)
                </span>
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
