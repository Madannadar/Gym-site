import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useMeals } from "../context/MealContext";

const NewMeal = () => {
  const [mealType, setMealType] = useState("");
  const [mealName, setMealName] = useState("");
  const [nutrition, setNutrition] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const { addMeal } = useMeals();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setNutrition((prev) => ({ ...prev, [field]: value }));
  };

  
  const handleSaveMeal = () => {
    if (!mealType || !mealName) {
      alert("Please select a meal type and enter a meal name.");
      return;
    }

    // Ensure all nutritional fields are filled and contain only numbers
    for (const key in nutrition) {
      if (!nutrition[key].trim() || isNaN(nutrition[key]) || Number(nutrition[key]) <= 0) {
        alert(`Please enter a valid number for ${key}.`);
        return;
      }
    }

    addMeal(mealType, mealName, nutrition);
    alert("Meal saved successfully!");
    navigate("/meal-tracker");
  };

  return (
    <div
      className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg border border-gray-200"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <FaUtensils className="text-3xl text-[#4B9CD3]" />
        <h1 className="text-2xl font-bold text-black">New Meal</h1>
      </div>

      {/* Meal Type */}
      <div className="mt-5">
        <label className="block text-lg font-semibold text-gray-800">Meal Type</label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
        >
          <option value="">Select Meal Type</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snacks">Snacks</option>
        </select>
      </div>

      {/* Meal Name */}
      <div className="mt-4">
        <label className="block text-lg font-semibold text-gray-800">Meal</label>
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
          placeholder="Enter meal name"
        />
      </div>

      {/* Nutritional Inputs */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {["calories", "protein", "carbs", "fats"].map((field) => (
          <div key={field}>
            <label className="block text-sm text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)} (g)
            </label>
            <input
              type="number"
              value={nutrition[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
              placeholder={field}
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveMeal}
        className="mt-6 w-full py-2 bg-[#4B9CD3] text-white rounded-lg font-semibold hover:bg-[#3588a2] transition duration-200 ease-in-out"
      >
        Save Meal
      </button>
    </div>
  );
};

export default NewMeal;
