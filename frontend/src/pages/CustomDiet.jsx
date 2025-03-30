import { FaBowlFood, FaCheck } from 'react-icons/fa6';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CustomDiet = () => {
  const navigate = useNavigate();
  
  const [dietName, setDietName] = useState("");
  const [calories, setCalories] = useState("");
  const [meals, setMeals] = useState(3);
  const [dietType, setDietType] = useState("Weight Loss");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [image, setImage] = useState(null);

  const handleSave = () => {
    // Show popup alert
    alert("Custom Diet Plan Created!");

    // Navigate to Diet page after alert
    navigate("/diet");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <FaBowlFood className="text-4xl text-[#4B9CD3]" />
        <h1 className="text-3xl font-semibold text-gray-900">Create Custom Diet Plan</h1>
      </div>
      <p className="text-gray-600 text-sm sm:text-lg mb-6">Customize your diet plan by providing the necessary details.</p>

      {/* Form for Custom Diet Plan */}
      <div className="space-y-6">
        {/* Diet Plan Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Diet Plan Name</label>
          <input
            type="text"
            placeholder="Enter diet plan name"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            value={dietName}
            onChange={(e) => setDietName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            placeholder="Enter diet description"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Diet Plan Image */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Diet Plan Image</label>
          <div className="relative w-full">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
            <div className="w-full py-4 px-6 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center justify-center gap-3">
              {image ? (
                <img src={image} alt="Diet Plan" className="w-32 h-32 object-cover rounded-lg" />
              ) : (
                <>
                  <span className="text-gray-400">Click to upload an image</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Calories */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Calories</label>
          <input
            type="number"
            placeholder="Enter total calories"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>

        {/* Number of Meals */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Number of Meals</label>
          <input
            type="number"
            min="1"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            value={meals}
            onChange={(e) => setMeals(e.target.value)}
          />
        </div>

        {/* Diet Type */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Diet Type</label>
          <select
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            value={dietType}
            onChange={(e) => setDietType(e.target.value)}
          >
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Building">Muscle Building</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Vegetarian">Vegetarian</option>
          </select>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Difficulty</label>
          <select
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-[#4B9CD3] text-white rounded-lg text-sm hover:bg-blue-600 transition-all duration-200"
          >
            <FaCheck /> Save Custom Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDiet;
