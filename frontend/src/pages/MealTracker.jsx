import { FaBowlFood, FaPlus } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../AxiosSetup";
import MealCard from "../components/MealCard.jsx";
import { useMeals } from "../context/MealContext";
import { useAuth } from "../AuthProvider";

const MealTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { meals: availableMeals } = useMeals();
  const { uid } = useAuth();
  const [todaySelectedMeals, setTodaySelectedMeals] = useState([]);
  const [yesterdaySelectedMeals, setYesterdaySelectedMeals] = useState([]);
  const [yesterdaySummary, setYesterdaySummary] = useState([]);
  const [dietTargets, setDietTargets] = useState({
    calories: 2400,
    protein: 165,
    carbs: 275,
    fat: 100,
  });
  const [error, setError] = useState(null);
  const mealTypesOrder = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  useEffect(() => {
    const fetchSelectedDietPlan = async () => {
      if (!uid) return;
      try {
        const userResponse = await apiClient.get("/users/me");
        if (userResponse.data.user?.selected_template_id) {
          const templateResponse = await apiClient.get(
            `/diet-templets/${userResponse.data.user.selected_template_id}`
          );
          const { calories, protein, carbs, fats } = templateResponse.data.template;
          setDietTargets({
            calories: Number(calories) || 2400,
            protein: Number(protein) || 165,
            carbs: Number(carbs) || 275,
            fat: Number(fats) || 100,
          });
        }
      } catch (err) {
        console.error("Error fetching diet plan:", err.response?.data || err);
        setError("Failed to load diet targets.");
      }
    };

    const fetchTodayMeals = async () => {
      if (!uid) return;
      try {
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        console.log("🔍 Fetching meals for UID:", uid, "Date:", today);
        const response = await apiClient.get(`/diet-logs/user/${uid}?log_date=${today}`);
        console.log("🔍 API Response for today's meals:", response.data);
        const logs = response.data.logs || [];
        const meals = await Promise.all(
          logs.flatMap((log) =>
            ["breakfast", "lunch", "dinner", "snacks"].flatMap(async (type) => {
              if (!log[type]) return [];
              const items = log[type];
              return Promise.all(
                items.map(async (item) => {
                  let dishName = item.dish_name;
                  let dishId = item.dish_id;
                  if (dishId && !dishName) {
                    try {
                      const dishResponse = await apiClient.get(`/dishes/${dishId}`);
                      dishName = dishResponse.data.dish?.dish_name || "Unknown";
                    } catch (err) {
                      console.error(`Error fetching dish ${dishId}:`, err);
                    }
                  }
                  if (!dishId && dishName) {
                    try {
                      const dishResponse = await apiClient.get(
                        `/dishes_id?name=${encodeURIComponent(dishName)}`
                      );
                      dishId = dishResponse.data.dish?.dish_id || null;
                    } catch (err) {
                      console.error(`Error fetching dish ID for ${dishName}:`, err);
                    }
                  }
                  return {
                    type: type.charAt(0).toUpperCase() + type.slice(1),
                    meal: dishName,
                    dish_name: dishName,
                    dish_id: dishId,
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
        setTodaySelectedMeals(meals.flat().sort((a, b) => mealTypesOrder.indexOf(a.type) - mealTypesOrder.indexOf(b.type)));
      } catch (err) {
        console.error("Error fetching today's meals:", err.response?.data || err);
        setError("Failed to load today's meals.");
      }
    };

    const fetchYesterdayMeals = async () => {
      if (!uid) return;
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        console.log("🔍 Fetching meals for UID:", uid, "Date:", yesterdayDate);
        const response = await apiClient.get(`/diet-logs/user/${uid}?log_date=${yesterdayDate}`);
        console.log("🔍 API Response for yesterday's meals:", response.data);
        const logs = response.data.logs || [];
        const meals = await Promise.all(
          logs.flatMap((log) =>
            ["breakfast", "lunch", "dinner", "snacks"].flatMap(async (type) => {
              if (!log[type]) return [];
              const items = log[type];
              return Promise.all(
                items.map(async (item) => {
                  let dishName = item.dish_name;
                  let dishId = item.dish_id;
                  if (dishId && !dishName) {
                    try {
                      const dishResponse = await apiClient.get(`/dishes/${dishId}`);
                      dishName = dishResponse.data.dish?.dish_name || "Unknown";
                    } catch (err) {
                      console.error(`Error fetching dish ${dishId}:`, err);
                    }
                  }
                  if (!dishId && dishName) {
                    try {
                      const dishResponse = await apiClient.get(
                        `/dishes_id?name=${encodeURIComponent(dishName)}`
                      );
                      dishId = dishResponse.data.dish?.dish_id || null;
                    } catch (err) {
                      console.error(`Error fetching dish ID for ${dishName}:`, err);
                    }
                  }
                  return {
                    type: type.charAt(0).toUpperCase() + type.slice(1),
                    meal: dishName,
                    dish_name: dishName,
                    dish_id: dishId,
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
        const fetchedMeals = meals.flat().sort((a, b) => mealTypesOrder.indexOf(a.type) - mealTypesOrder.indexOf(b.type));

        // Calculate summary
        const totals = fetchedMeals.reduce(
          (acc, meal) => ({
            calories: acc.calories + (Number(meal.actual_calories) || 0),
            protein: acc.protein + (Number(meal.proteins) || 0),
            carbs: acc.carbs + (Number(meal.carbs) || 0),
            fat: acc.fat + (Number(meal.fats) || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        const caloriesPercent = Math.min(
          Math.round((totals.calories / (dietTargets.calories || 2400)) * 100),
          100
        );
        const proteinPercent = Math.min(
          Math.round((totals.protein / (dietTargets.protein || 165)) * 100),
          100
        );
        const carbsPercent = Math.min(
          Math.round((totals.carbs / (dietTargets.carbs || 275)) * 100),
          100
        );
        const fatPercent = Math.min(
          Math.round((totals.fat / (dietTargets.fat || 100)) * 100),
          100
        );

        setYesterdaySelectedMeals(fetchedMeals);
        setYesterdaySummary([
          { label: "Calories", value: `${totals.calories} kcal`, percent: caloriesPercent },
          { label: "Protein", value: `${totals.protein}g`, percent: proteinPercent },
          { label: "Carbs", value: `${totals.carbs}g`, percent: carbsPercent },
          { label: "Fat", value: `${totals.fat}g`, percent: fatPercent },
        ]);
      } catch (err) {
        console.error("Error fetching yesterday's meals:", err.response?.data || err);
        setError("Failed to load yesterday's meals.");
      }
    };

    fetchSelectedDietPlan();
    fetchTodayMeals();
    fetchYesterdayMeals();
  }, [uid]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <FaBowlFood className="text-3xl sm:text-4xl text-[#4B9CD3]" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#4B9CD3]">
          Nutrition Dashboard
        </h1>
      </div>
      <p className="text-gray-600 mt-4 text-sm sm:text-base">
        Monitor your daily intake, plan your meals, and achieve your nutrition goals with our intuitive tools.
      </p>
      <div className="flex justify-between items-center gap-3 mt-5 space-y-2 sm:space-y-0">
        {[
          { name: "Diet Plans", route: "/diet" },
          { name: "Meal Tracker", route: "/meal-tracker" },
          { name: "Nutrition Stats", route: "/nutrition" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex-1 px-3 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => navigate(item.route)}
          >
            {item.name}
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      <div className="mt-8 flex justify-between items-center">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-600">
          Recent Meals
        </h3>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#4B9CD3] text-white rounded-lg hover:bg-blue-500 transition duration-200"
          onClick={() => navigate("/new-meal")}
        >
          <FaPlus />
          Log New Meal
        </button>
      </div>
      <div className="mt-8 grid space-y-4 sm:grid-cols-2 sm:space-y-0 gap-4">
        <MealCard
          title="Today"
          meals={todaySelectedMeals}
          dietTargets={dietTargets}
        />
        <MealCard
          title="Yesterday"
          meals={yesterdaySelectedMeals}
          summary={yesterdaySummary}
          dietTargets={dietTargets}
        />
      </div>
    </div>
  );
};

export default MealTracker;
