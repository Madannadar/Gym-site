import { FaBowlFood, FaPlus } from "react-icons/fa6";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MealCard from "../components/MealCard.jsx";
import { useMeals } from "../context/MealContext"; // Import useMeals only

const MealTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { meals: availableMeals } = useMeals(); // Get available meals from context

  // State to track today's selected meals
  const [todaySelectedMeals, setTodaySelectedMeals] = useState([]);

  const yesterdayMeals = [
    { type: "Breakfast", description: "Eggs and whole grain toast" },
    { type: "Lunch", description: "Quinoa bowl with vegetables" },
    { type: "Dinner", description: "Stir fry with brown rice" },
    { type: "Snacks", description: "Protein shake, nuts" },
  ];

  const todaySummary = [
    { label: "Calories", value: "1800 kcal", percent: 75 },
    { label: "Protein", value: "100g", percent: 60 },
    { label: "Carbs", value: "220g", percent: 80 },
    { label: "Fat", value: "50g", percent: 50 },
  ];

  const yesterdaySummary = [
    { label: "Calories", value: "1700 kcal", percent: 70 },
    { label: "Protein", value: "90g", percent: 55 },
    { label: "Carbs", value: "200g", percent: 70 },
    { label: "Fat", value: "45g", percent: 60 },
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FaBowlFood className="text-3xl sm:text-4xl text-[#4B9CD3]" />
        <h1 className="text-2xl sm:text-4xl font-bold text-black">
          Diet Management
        </h1>
      </div>
      <p className="text-gray-700 mt-4 text-sm sm:text-lg">
        Track your nutrition, create meal plans, and achieve your dietary goals with our comprehensive diet management tools.
      </p>
      {/* Feature Boxes */}
      <div className="flex justify-between items-center gap-3 mt-5 text-xs sm:text-sm">
        {[
          { label: "Diet Plans", path: "/diet" },
          { label: "Meal Tracker", path: "/meal-tracker" },
          { label: "Nutrition Stats", path: "/nutrition" },
        ].map((feature, index) => (
          <div
            key={index}
            className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
            onClick={() => navigate(feature.path)}
          >
            {feature.label}
          </div>
        ))}
      </div>
      {/* Recent Meals & Log New Meal */}
      <div className="mt-8 flex justify-between items-center">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Recent Meals
        </h3>
        <button
          className="flex items-center gap-2 px-4 py-1.5 bg-[#4B9CD3] text-white rounded-lg hover:bg-[#3588a2] transition duration-200 ease-in-out"
          onClick={() => navigate("/new-meal")}
        >
          <FaPlus />
          Log New Meal
        </button>
      </div>
      {/* Meal Tracker Content */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <MealCard
          title="Today"
          meals={todaySelectedMeals}
          summary={todaySummary}
          setSelectedMeals={setTodaySelectedMeals} // Pass setter to update today's meals
        />
        <MealCard title="Yesterday" meals={yesterdayMeals} summary={yesterdaySummary} />
      </div>
    </div>
  );
};

export default MealTracker;
