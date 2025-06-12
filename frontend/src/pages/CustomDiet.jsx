import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";
import { FaBowlFood, FaXmark } from "react-icons/fa6";

const CustomDiet = () => {
  const navigate = useNavigate();
  const { uid } = useAuth();

  const [formData, setFormData] = useState({
    dietName: "",
    calories: "",
    meals: 3,
    description: "",
    difficulty: "Medium",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { dietName, calories, protein, carbs, fats, meals } = formData;

    if (!dietName.trim()) {
      setError("Please enter a valid diet plan name.");
      return;
    }

    if (!calories || isNaN(calories) || Number(calories) <= 0) {
      setError("Please enter a valid calorie amount.");
      return;
    }

    for (const [field, value] of [
      ["protein", protein],
      ["carbs", carbs],
      ["fats", fats],
    ]) {
      if (value && (isNaN(value) || Number(value) <= 0)) {
        setError(`Please enter a valid number for ${field}.`);
        return;
      }
    }

    try {
      const templateData = {
        created_by: uid,
        name: dietName,
        description:
          formData.description || "A custom diet plan tailored to your needs.",
        breakfast: null,
        lunch: null,
        dinner: null,
        snacks: [],
        number_of_meals: Number(meals),
        difficulty: formData.difficulty.toLowerCase(),
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
      };

      const response = await apiClient.post("/diet-templets", templateData);

      navigate("/diet", { state: { followedPlan: response.data.template } });
    } catch (err) {
      console.error("Error saving diet plan:", err);
      setError(err.response?.data?.error || "Failed to save diet plan.");
    }
  };

  const handleCancel = () => {
    navigate("/diet");
  };

  const macroFields = [
    { key: "protein", label: "Protein" },
    { key: "carbs", label: "Carbs" },
    { key: "fats", label: "Fats" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full">
      <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <FaBowlFood className="text-3xl text-[#4B9CD3]" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Create Custom Diet Plan
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base mt-2 mb-6">
          Customize your diet plan to meet your nutritional goals.
        </p>

        {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-800">
            Diet Plan Name
          </label>
          <input
            type="text"
            value={formData.dietName}
            onChange={(e) => handleChange("dietName", e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            placeholder="Enter diet plan name"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-800">
            Total Calories (kcal)
          </label>
          <input
            type="number"
            min="0"
            value={formData.calories}
            onChange={(e) => handleChange("calories", e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            placeholder="Enter total calories"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-800">
            Number of Meals
          </label>
          <select
            value={formData.meals}
            onChange={(e) => handleChange("meals", e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-800">
            Difficulty Level
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => handleChange("difficulty", e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-800">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            placeholder="Describe your diet plan"
            rows={3}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {macroFields.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-800">
                {label} (grams)
              </label>
              <input
                type="number"
                min="0"
                value={formData[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-[#4B9CD3] text-white rounded-lg font-semibold hover:bg-[#3588a2] transition duration-200 ease-in-out"
          >
            Create Plan
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

export default CustomDiet;
