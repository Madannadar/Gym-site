import { useNavigate, useLocation } from "react-router-dom";
import { FaDumbbell, FaQrcode } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useMeals } from "../context/MealContext";
import { useAuth } from "../AuthProvider";
import { apiClient } from "../AxiosSetup";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uid, authenticated } = useAuth();
  const { mealNutritionData, addMeal } = useMeals();
  const [nutritionSummary, setNutritionSummary] = useState([
    { label: "Calories", value: "0 kcal", percent: 0 },
    { label: "Protein", value: "0g", percent: 0 },
    { label: "Carbs", value: "0g", percent: 0 },
    { label: "Fat", value: "0g", percent: 0 },
  ]);
  const [consumedMeals, setConsumedMeals] = useState([]);
  const [error, setError] = useState(null);

  // Static diet targets
  const dietTargets = {
    calories: 2400,
    protein: 165,
    carbs: 275,
    fat: 100,
  };

  // Mock data for other widgets
  const attendanceData = { total: 5 };
  const workoutData = {
    day: "Wednesday",
    date: "April 09",
    minutes: "90 Minutes",
  };

  const fetchTodayMeals = async () => {
    if (!authenticated || !uid || isNaN(parseInt(uid))) {
      setError("Please log in to view diet data.");
      return;
    }

    try {
      setError(null);
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const response = await apiClient.get(`/diet-logs/user/${uid}?log_date=${today}`);
      const logs = response.data.logs || [];

      const meals = await Promise.all(
        logs.flatMap((log) =>
          ["breakfast", "lunch", "dinner", "snacks"].flatMap(async (type) => {
            if (!log[type]) return [];
            const mealType = type.charAt(0).toUpperCase() + type.slice(1);
            const items = log[type];
            return Promise.all(
              items.map(async (item) => {
                let dishName = item.dish_name;
                let dishId = item.dish_id;

                // Resolve missing dishName or dishId
                if (dishId && !dishName) {
                  const cachedDish = Object.values(mealNutritionData[mealType] || {}).find(
                    (d) => d.id === dishId
                  );
                  if (cachedDish) {
                    dishName = cachedDish.name;
                  } else {
                    try {
                      const dishResponse = await apiClient.get(`/dishes/${dishId}`);
                      dishName = dishResponse.data.dish?.dish_name || "Unknown";
                    } catch (err) {
                      console.error(`Error fetching dish ${dishId}:`, err);
                    }
                  }
                } else if (!dishId && dishName) {
                  const cachedDish = Object.values(mealNutritionData[mealType] || {}).find(
                    (d) => d.name === dishName
                  );
                  if (cachedDish) {
                    dishId = cachedDish.id;
                  } else {
                    try {
                      const dishResponse = await apiClient.get(
                        `/dishes_id?name=${encodeURIComponent(dishName)}`
                      );
                      dishId = dishResponse.data.dish?.dish_id || null;
                    } catch (err) {
                      console.error(`Error fetching dish ID for ${dishName}:`, err);
                    }
                  }
                }

                return {
                  type: mealType,
                  meal: dishName || "Unknown",
                  dish_name: dishName || "Unknown",
                  dish_id: dishId || null,
                  actual_calories: Number(item.actual_calories) || 0,
                  proteins: Number(item.proteins) || 0,
                  carbs: Number(item.carbs) || 0,
                  fats: Number(item.fats) || 0,
                  quantity: Number(item.quantity) || 1,
                };
              })
            );
          })
        )
      );

      // Calculate nutritional summary
      const totals = meals.flat().reduce(
        (acc, meal) => ({
          calories: acc.calories + (Number(meal.actual_calories) || 0),
          protein: acc.protein + (Number(meal.proteins) || 0),
          carbs: acc.carbs + (Number(meal.carbs) || 0),
          fat: acc.fat + (Number(meal.fats) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setNutritionSummary([
        {
          label: "Calories",
          value: `${totals.calories} kcal`,
          percent: Math.min(
            Math.round((totals.calories / dietTargets.calories) * 100),
            100
          ),
        },
        {
          label: "Protein",
          value: `${totals.protein}g`,
          percent: Math.min(
            Math.round((totals.protein / dietTargets.protein) * 100),
            100
          ),
        },
        {
          label: "Carbs",
          value: `${totals.carbs}g`,
          percent: Math.min(
            Math.round((totals.carbs / dietTargets.carbs) * 100),
            100
          ),
        },
        {
          label: "Fat",
          value: `${totals.fat}g`,
          percent: Math.min(
            Math.round((totals.fat / dietTargets.fat) * 100),
            100
          ),
        },
      ]);

      // Generate consumed meals
      const mealGroups = meals.flat().reduce((acc, meal) => {
        const existing = acc.find((m) => m.name === meal.type);
        if (existing) {
          existing.detail += `, ${meal.dish_name}`;
        } else {
          acc.push({ name: meal.type, detail: meal.dish_name });
        }
        return acc;
      }, []);

      // Ensure all meal types are included, even if empty
      const allMealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
      const consumedMeals = allMealTypes.map((type) => {
        const group = mealGroups.find((m) => m.name === type);
        return {
          name: type,
          detail: group ? group.detail : "None",
        };
      });

      setConsumedMeals(consumedMeals);
    } catch (err) {
      console.error("Error fetching today's meals:", err);
      setError(
        err.response?.status === 401
          ? "Please log in again."
          : "Failed to load diet data."
      );
    }
  };

  useEffect(() => {
    fetchTodayMeals();
  }, [location.pathname, uid, authenticated]);

  const handleScanQR = () => {
    navigate("/user-attendance");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Title and Welcome Text */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <FaDumbbell className="text-2xl sm:text-3xl text-[#4B9CD3]" />
          <h1 className="text-2xl sm:text-4xl font-bold text-black px-0.5">
            Gym Dashboard
          </h1>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Welcome to your gym. Access all features of gym. Reach your fitness
          goal with ease.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-2 bg-white p-3 rounded-lg shadow-md border border-red-400 text-red-600 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Section */}
        <div
          className="bg-[#4B9CD3] text-white p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-blue-500 transition-all duration-200 flex justify-center items-center h-[140px] sm:h-[200px]"
          onClick={handleScanQR}
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaQrcode
                className="text-[70px] sm:text-[90px]"
                style={{ padding: "6px" }}
              />
              <span className="absolute top-0 left-0 border-t-4 border-l-4 border-white w-3 h-3"></span>
              <span className="absolute top-0 right-0 border-t-4 border-r-4 border-white w-3 h-3"></span>
              <span className="absolute bottom-0 left-0 border-b-4 border-l-4 border-white w-3 h-3"></span>
              <span className="absolute bottom-0 right-0 border-b-4 border-r-4 border-white w-3 h-3"></span>
            </div>
            <div className="text-center">
              <h2 className="text-base sm:text-lg font-semibold">Get today’s</h2>
              <div className="text-xl sm:text-2xl font-bold">Attendance</div>
            </div>
          </div>
        </div>

        {/* Today's Workout */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-default">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Today's Workout
          </h3>
          <div className="h-auto md:h-[100px] flex flex-col md:justify-center">
            <div className="flex flex-col items-center bg-green-400 text-white px-4 py-2 rounded-full">
              <span className="text-sm font-semibold">
                {workoutData.day}, {workoutData.date}
              </span>
              <span className="text-xl font-bold mt-1">
                Workout: {workoutData.minutes}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Nutrition Summary */}
        <div
          className="bg-white p-4 rounded-lg shadow-md border-b-4 border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => navigate("/meal-tracker")}
        >
          <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-2">
            Nutritional Summary
          </h3>
          <div className="mt-2 space-y-2 text-xs sm:text-sm text-gray-700">
            {nutritionSummary.map((item, index) => (
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
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
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

        {/* Today's Consumed Meals */}
        <div
          className="bg-white p-4 rounded-lg shadow-md border-b-4 border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => navigate("/meal-tracker")}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Today’s Meals
          </h3>
          <ul className="text-gray-600 text-sm space-y-1">
            {consumedMeals.map((meal, index) => (
              <li key={index}>
                <span className="font-bold">{meal.name}:</span>
                <span className="ml-2">{meal.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Live Events */}
        <div className="bg-white p-4 rounded-lg shadow-md border-b-4 border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Live Events
          </h3>
          <p className="text-gray-600 text-sm">
            No events available at the moment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
