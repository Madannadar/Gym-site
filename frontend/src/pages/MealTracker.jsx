import { FaBowlFood, FaPlus } from "react-icons/fa6";  // FaBowlFood and FaPlus from fa6
import { FaSearch, FaEdit } from "react-icons/fa";     // FaSearch and FaEdit from fa
import { useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate

const MealTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();  // Initialize useNavigate

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FaBowlFood className="text-3xl sm:text-4xl text-[#4B9CD3]" />
        <h1 className="text-2xl sm:text-4xl font-bold text-black">
          Diet Management
        </h1>
      </div>
      <p className="text-gray-700 mt-2 text-sm sm:text-lg">
        Track your nutrition, create meal plans, and achieve your dietary goals with our comprehensive diet management tools.
      </p>

      {/* Three Feature Boxes */}
      <div className="flex justify-between items-center gap-3 mt-5 text-xs sm:text-sm">
        {/* Diet Plans Box with onClick Navigation */}
        <div 
          className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
          onClick={() => navigate("/diet")}  // Add onClick to navigate to Diet.jsx
        >
          Diet Plans
        </div>
        <div 
          className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
          onClick={() => navigate("/meal-tracker")}
        >
          Meal Tracker
        </div>
        <div 
          className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
          onClick={() => navigate("/nutrition")} // Add onClick to navigate to Nutrition.jsx
        >
          Nutrition Stats
        </div>
      </div>

      {/* Recent Meals and Log New Meal in Same Row */}
      <div className="mt-8 flex justify-between items-center">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">Recent Meals</h3>
        <button
          className="flex items-center gap-2 px-4 py-1.5 bg-[#4B9CD3] text-white rounded-lg hover:bg-[#3588a2] transition duration-200 ease-in-out"
          onClick={() => navigate("/log-meal")}  // Change to your log meal page if needed
        >
          <FaPlus />
          Log New Meal
        </button>
      </div>

      {/* Meal Tracker Content */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5"> {/* Use grid layout */}
        {/* Combined Card for Today's Meals & Nutritional Summary */}
        <div className="bg-white shadow-lg rounded-lg p-5 mt-5 border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out">
          {/* Today's Meal Section */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Today
            </h3>
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
              <FaEdit />
              <span>Edit</span>
            </button>
          </div>

          {/* Meal Details with Smaller Text and Line Breaks */}
          <div className="mb-6 text-sm sm:text-base">
            <ul className="space-y-2">
              <li className="font-normal text-gray-700">
                <span className="text-lg">Breakfast:</span>
                <br />
                <span className="text-gray-600">Oatmeal with berries</span>
              </li>
              <li className="font-normal text-gray-700">
                <span className="text-lg">Lunch:</span>
                <br />
                <span className="text-gray-600">Grilled chicken salad</span>
              </li>
              <li className="font-normal text-gray-700">
                <span className="text-lg">Dinner:</span>
                <br />
                <span className="text-gray-600">Salmon with roasted vegetables</span>
              </li>
              <li className="font-normal text-gray-700">
                <span className="text-lg">Snacks:</span>
                <br />
                <span className="text-gray-600">Greek yogurt, apple</span>
              </li>
            </ul>
          </div>

          {/* Nutritional Summary */}
          <div className="mt-6 text-center">
            <h3 className="text-md sm:text-lg font-semibold text-gray-800">Nutritional Summary</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              {[
                { label: "Calories", value: "1800 kcal", percent: 75 },
                { label: "Protein", value: "100g", percent: 60 },
                { label: "Carbs", value: "220g", percent: 80 },
                { label: "Fat", value: "50g", percent: 50 },
              ].map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline">
                  {/* Nutrient Text and Value */}
                  <div className="flex items-center gap-2 w-full sm:w-3/5">
                    <span className="text-sm sm:text-base text-gray-800">{item.label}</span>
                    <span className="font-semibold text-xs sm:text-sm text-gray-700">{item.value}</span>
                    <span className="text-gray-500 text-xs sm:text-sm">({item.percent}%)</span>
                  </div>

                  {/* Nutrient Bar */}
                  <div className="w-full sm:w-2/5 mt-2 sm:mt-0">
                    <div className="w-full h-2 bg-gray-300 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.label === "Calories"
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
        </div> {/* End of Today's Meal Tracker Card */}

        {/* Yesterday's Meal Card */}
        <div className="bg-white shadow-lg rounded-lg p-5 mt-5 border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out">
          {/* Yesterday's Meal Section */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Yesterday
            </h3>
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
              <FaEdit />
              <span>Edit</span>
            </button>
          </div>

          {/* Meal Details with Smaller Text and Line Breaks */}
          <div className="mb-6 text-sm sm:text-base">
            <ul className="space-y-2">
              <li className="font-normal text-gray-700">
                <span className="text-lg">Breakfast:</span>
                <br />
                <span className="text-gray-600">Eggs and whole grain toast</span>
              </li>
              <li className="font-normal text-gray-700">
                <span className="text-lg">Lunch:</span>
                <br />
                <span className="text-gray-600">Quinoa bowl with vegetables</span>
              </li>
              <li className="font-normal text-gray-700">
                <span className="text-lg">Dinner:</span>
                <br />
                <span className="text-gray-600">Stir fry with brown rice</span>
              </li>
              <li className="font-normal text-gray-700">
                <span className="text-lg">Snacks:</span>
                <br />
                <span className="text-gray-600">Protein shake, nuts</span>
              </li>
            </ul>
          </div>

          {/* Nutritional Summary */}
          <div className="mt-6 text-center">
            <h3 className="text-md sm:text-lg font-semibold text-gray-800">Nutritional Summary</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              {[
                { label: "Calories", value: "1700 kcal", percent: 70 },
                { label: "Protein", value: "90g", percent: 55 },
                { label: "Carbs", value: "200g", percent: 70 },
                { label: "Fat", value: "45g", percent: 60 },
              ].map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline">
                  {/* Nutrient Text and Value */}
                  <div className="flex items-center gap-2 w-full sm:w-3/5">
                    <span className="text-sm sm:text-base text-gray-800">{item.label}</span>
                    <span className="font-semibold text-xs sm:text-sm text-gray-700">{item.value}</span>
                    <span className="text-gray-500 text-xs sm:text-sm">({item.percent}%)</span>
                  </div>

                  {/* Nutrient Bar */}
                  <div className="w-full sm:w-2/5 mt-2 sm:mt-0">
                    <div className="w-full h-2 bg-gray-300 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.label === "Calories"
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
        </div> {/* End of Yesterday's Meal Tracker Card */}
      </div>
    </div>
  );
};

export default MealTracker;
