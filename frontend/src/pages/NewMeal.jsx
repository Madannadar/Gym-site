import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaXmark } from "react-icons/fa6";
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";
import { MealContext } from "../context/MealContext";

const NewMeal = () => {
  const [mealType, setMealType] = useState("");
  const [mealName, setMealName] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [unit, setUnit] = useState("grams");
  const [amount, setAmount] = useState("");
  const [nutrition, setNutrition] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [error, setError] = useState("");

  const { uid, authenticated } = useAuth();
  const { addMeal } = useContext(MealContext);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setNutrition((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveMeal = async () => {
    if (!authenticated) {
      setError("Please log in to save a meal.");
      return;
    }
    if (!mealType || !mealName) {
      setError("Please select a meal type and enter a meal name.");
      return;
    }
    if (!amount.trim() || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    for (const key in nutrition) {
      if (!nutrition[key].trim() || isNaN(nutrition[key]) || Number(nutrition[key]) < 0) {
        setError(`Please enter a valid number for ${key}.`);
        return;
      }
    }
    if (!uid || isNaN(parseInt(uid))) {
      setError("User not authenticated.");
      return;
    }

    try {
      const today = new Date().toLocaleDateString("en-CA"); // Use local date (IST)
      console.log("🔍 Saving meal with payload:", {
        dish: {
          created_by: parseInt(uid),
          dish_name: mealName,
          calories: Number(nutrition.calories),
          protein: Number(nutrition.protein),
          fat: Number(nutrition.fats),
          carbs: Number(nutrition.carbs),
          units: [unit],
          unit_value: Number(amount),
          meal_type: mealType.toLowerCase(),
          is_vegetarian: isVeg,
        },
        log: {
          user_id: parseInt(uid),
          log_date: today,
          [mealType.toLowerCase()]: [
            {
              dish_id: null,
              quantity: Number(amount),
              actual_calories: Number(nutrition.calories),
              proteins: Number(nutrition.protein),
              carbs: Number(nutrition.carbs),
              fats: Number(nutrition.fats),
              dish_name: mealName,
            },
          ],
          total_calories: Number(nutrition.calories),
          proteins: Number(nutrition.protein),
          fats: Number(nutrition.fats),
          carbs: Number(nutrition.carbs),
        },
      });

      const response = await apiClient.post("/diet-logs/add", {
        dish: {
          created_by: parseInt(uid),
          dish_name: mealName,
          calories: Number(nutrition.calories),
          protein: Number(nutrition.protein),
          fat: Number(nutrition.fats),
          carbs: Number(nutrition.carbs),
          units: [unit],
          unit_value: Number(amount),
          meal_type: mealType.toLowerCase(),
          is_vegetarian: isVeg,
        },
        log: {
          user_id: parseInt(uid),
          log_date: today,
          [mealType.toLowerCase()]: [
            {
              dish_id: null,
              quantity: Number(amount),
              actual_calories: Number(nutrition.calories),
              proteins: Number(nutrition.protein),
              carbs: Number(nutrition.carbs),
              fats: Number(nutrition.fats),
              dish_name: mealName,
            },
          ],
          total_calories: Number(nutrition.calories),
          proteins: Number(nutrition.protein),
          fats: Number(nutrition.fats),
          carbs: Number(nutrition.carbs),
        },
      });

      console.log("✅ Meal saved:", response.data);
      await addMeal();

      alert("Meal saved and logged successfully!");
      navigate("/meal-tracker");
    } catch (err) {
      console.error("❌ Error saving meal:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.error ||
          (err.message.includes("CORS") || err.message.includes("Network")
            ? "Unable to reach server. Please check if the backend is running."
            : "Failed to save meal.")
      );
    }
  };

  const handleCancel = () => {
    navigate("/meal-tracker");
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div
        className="p-6 bg-white shadow-lg rounded-lg border border-gray-200"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div className="flex items-center gap-2">
          <FaUtensils className="text-3xl text-[#4B9CD3]" />
          <h1 className="text-2xl font-bold text-black">New Meal</h1>
        </div>
        {error && <p className="mt-2 text-red-500">{error}</p>}

        <div className="mt-5">
          <label className="block text-lg font-semibold text-gray-800">
            Meal Type
          </label>
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

        <div className="mt-4">
          <label className="block text-lg font-semibold text-gray-800">
            Meal
          </label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            placeholder="Enter meal name"
          />
        </div>

        <div className="mt-4">
          <label className="block text-lg font-semibold text-gray-800">
            Meal Category
          </label>
          <select
            value={isVeg ? "Vegetarian" : "Non-Vegetarian"}
            onChange={(e) => setIsVeg(e.target.value === "Vegetarian")}
            className="mt-2 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
          >
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-lg font-semibold text-gray-800">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
          >
            <option value="grams">Grams</option>
            <option value="slices">Slices</option>
            <option value="ml">Milliliters</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-lg font-semibold text-gray-800">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            placeholder="Enter amount (e.g., 100)"
          />
        </div>

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

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleSaveMeal}
            className="w-full py-2 bg-[#4B9CD3] text-white rounded-lg font-semibold hover:bg-[#3588a2] transition duration-200 ease-in-out"
          >
            Save Meal
          </button>
          <button
            onClick={handleCancel}
            className="w-full py-2 bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 ease-in-out"
          >
            <FaXmark className="inline-block mr-2" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewMeal;
