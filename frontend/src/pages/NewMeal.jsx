import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaUtensils } from "react-icons/fa"; // Importing a suitable meal-related icon

const NewMeal = () => {
  const [selectedDay, setSelectedDay] = useState("today");
  const [meals, setMeals] = useState({
    today: {
      breakfast: {
        name: "Pancakes with maple syrup",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
      lunch: {
        name: "Turkey and avocado wrap",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
      dinner: {
        name: "Grilled shrimp with quinoa",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
      snacks: {
        name: "Carrot sticks with hummus",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
    },
    tomorrow: {
      breakfast: {
        name: "Smoothie bowl with granola",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
      lunch: {
        name: "Veggie stir-fry with tofu",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
      dinner: {
        name: "Chicken breast with steamed broccoli",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
      snacks: {
        name: "Almonds and a pear",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
    },
  });

  const navigate = useNavigate();

  const handleSaveMeal = () => {
    // Save the meal logic here, then navigate back to MealTracker page
    alert("Meals saved successfully!");
    navigate("/meal-tracker"); // Navigate back to MealTracker after saving
  };

  const handleInputChange = (mealType, nutrient, value) => {
    setMeals({
      ...meals,
      [selectedDay]: {
        ...meals[selectedDay],
        [mealType]: {
          ...meals[selectedDay][mealType],
          [nutrient]: value,
        },
      },
    });
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header with Icon */}
      <div className="flex items-center gap-2">
        <FaUtensils className="text-3xl text-[#4B9CD3]" /> {/* Icon beside the heading */}
        <h1 className="text-2xl sm:text-4xl font-bold text-black">New Meal</h1>
      </div>
      <p className="text-gray-700 mt-2 text-sm sm:text-lg">
        Log your meals for today or tomorrow.
      </p>

      {/* Day Selector Dropdown */}
      <div className="mt-8">
        <label className="text-lg sm:text-xl font-semibold text-gray-800">Select Day</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="mt-3 p-2 border border-gray-300 rounded-lg w-full sm:w-1/3"
        >
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
        </select>
      </div>

      {/* Meal Input Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Meal Input Card */}
        {["breakfast", "lunch", "dinner", "snacks"].map((mealType) => (
          <div key={mealType} className="bg-white shadow-lg rounded-lg p-5 mt-5 border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
            
            {/* Meal Name */}
            <input
              type="text"
              value={meals[selectedDay][mealType].name}
              onChange={(e) => handleInputChange(mealType, "name", e.target.value)}
              className="mt-3 p-2 border border-gray-300 rounded-lg w-full"
              placeholder={`Enter ${mealType} name`}
            />
            
            {/* Nutritional Info */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">Calories</label>
                <input
                  type="number"
                  value={meals[selectedDay][mealType].calories}
                  onChange={(e) => handleInputChange(mealType, "calories", e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                  placeholder="Calories"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Protein (g)</label>
                <input
                  type="number"
                  value={meals[selectedDay][mealType].protein}
                  onChange={(e) => handleInputChange(mealType, "protein", e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                  placeholder="Protein"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Carbs (g)</label>
                <input
                  type="number"
                  value={meals[selectedDay][mealType].carbs}
                  onChange={(e) => handleInputChange(mealType, "carbs", e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                  placeholder="Carbs"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Fats (g)</label>
                <input
                  type="number"
                  value={meals[selectedDay][mealType].fats}
                  onChange={(e) => handleInputChange(mealType, "fats", e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                  placeholder="Fats"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Meal Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSaveMeal}
          className="px-6 py-2 bg-[#4B9CD3] text-white rounded-lg hover:bg-[#3588a2] transition duration-200 ease-in-out"
        >
          Save Meals
        </button>
      </div>
    </div>
  );
};

export default NewMeal;
