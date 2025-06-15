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
        const today = new Date().toLocaleDateString("en-CA"); // Use local date (IST)
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

    fetchSelectedDietPlan();
    fetchTodayMeals();
  }, [uid]);

  const yesterdayMeals = [
    { type: "Breakfast", description: "Scrambled Eggs with Whole Grain Toast" },
    { type: "Lunch", description: "Quinoa Veggie Bowl" },
    { type: "Dinner", description: "Stir-fried Tofu with Brown Rice" },
    { type: "Snacks", description: "Greek Yogurt with Berries" },
  ];

  const yesterdaySummary = [
    { label: "Calories", value: "1750 kcal", percent: 73 },
    { label: "Protein", value: "85g", percent: 52 },
    { label: "Carbs", value: "210g", percent: 60 },
    { label: "Fat", value: "65g", percent: 65 },
  ];

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
          meals={yesterdayMeals}
          summary={yesterdaySummary}
        />
      </div>
    </div>
  );
};

export default MealTracker;
