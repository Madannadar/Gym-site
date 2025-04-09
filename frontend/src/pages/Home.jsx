import { useNavigate } from "react-router-dom";
import { FaDumbbell, FaQrcode, FaUtensils } from "react-icons/fa6";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();

  // Mock data
  const attendanceData = {
    total: 5, // Total attendance for today
  };

  const workoutData = {
    day: "Wednesday",
    date: "April 09",
    minutes: "90 Minutes",
  };

  const nutritionSummary = [
    { label: "Calories", value: "1200 kcal", percent: 60 },
    { label: "Protein", value: "60g", percent: 60 },
    { label: "Carbs", value: "150g", percent: 60 },
    { label: "Fats", value: "40g", percent: 57 },
  ];

  const consumedMeals = [
    { name: "Breakfast", detail: "Oatmeal with berries" },
    { name: "Lunch", detail: "Grilled chicken salad" },
    { name: "Dinner", detail: "Salmon with roasted vegetables" },
    { name: "Snacks", detail: "Greek yogurt, apple" },
  ];

  const handleScanQR = () => {
    // Placeholder for QR scanning logic
    alert("Scan QR to get today's attendance!");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Title and Welcome Text */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <FaDumbbell className="text-2xl sm:text-3xl text-[#4B9CD3]" />
          <h1 className="text-2xl sm:text-4xl font-bold text-black px-0.5">Gym Dashboard</h1>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Welcome to your gym. Access all features of gym. Reach your fitness goal with ease.
        </p>
      </div>

      {/* Cards Grid - Stacked on mobile, side-by-side on laptop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Section */}
        <div
          className="bg-[#4B9CD3] text-white p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-blue-500 transition-all duration-200 flex justify-center items-center h-[180px] sm:h-[200px]"
          onClick={handleScanQR}
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaQrcode className="text-[70px] sm:text-[90px]" style={{ padding: "6px" }} />
              <span className="absolute top-0 left-0 border-t-4 border-l-4 border-white w-3 h-3"></span>
              <span className="absolute top-0 right-0 border-t-4 border-r-4 border-white w-3 h-3"></span>
              <span className="absolute bottom-0 left-0 border-b-4 border-l-4 border-white w-3 h-3"></span>
              <span className="absolute bottom-0 right-0 border-b-4 border-r-4 border-white w-3 h-3"></span>
            </div>
            <div className="text-center">
              <h2 className="text-base sm:text-lg font-semibold">Get todays</h2>
              <div className="text-xl sm:text-2xl font-bold">Attendance</div>
            </div>
          </div>
        </div>

        {/* Today's Workout */}
        <div
          className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-default"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Today's Workout</h3>
          <div className="flex flex-col items-center bg-green-400 text-white px-4 py-2 rounded-full">
            <span className="text-sm font-semibold">{workoutData.day}, {workoutData.date}</span>
            <span className="text-xl font-bold mt-1">Workout: {workoutData.minutes}</span>
          </div>
        </div>

        {/* Today's Nutrition Summary */}
        <div
          className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => navigate("/meal-tracker")}
        >
          <h3 className="text-md sm:text-lg font-semibold text-gray-800">Nutritional Summary</h3>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            {nutritionSummary.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline"
              >
                <div className="flex items-center gap-2 w-full sm:w-3/5">
                  <span className="text-sm sm:text-base text-gray-800">{item.label}</span>
                  <span className="font-semibold text-xs sm:text-sm text-gray-700">
                    {item.value}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm">({item.percent}%)</span>
                </div>
                <div className="w-full sm:w-2/5 mt-2 sm:mt-0">
                  <div className="w-full h-2 bg-gray-300 rounded-full">
                    <div
                      className="h-full rounded-full"
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
          className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => navigate("/meal-tracker")}
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Today's Meals</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            {consumedMeals.map((meal, index) => (
              <li key={index}>
                <span className="font-bold">{meal.name}:</span>
                <span className="ml-2">{meal.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Live Events (Empty for now) */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Events</h3>
          <p className="text-gray-600 text-sm">No events available at the moment.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
