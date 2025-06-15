import { FaBowlFood } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Nutrition = () => {
  const navigate = useNavigate();
  const { uid } = useAuth();
  const [calorieData, setCalorieData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Calories (kcal)',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(75, 156, 211, 0.5)',
        borderColor: 'rgba(75, 156, 211, 1)',
        borderWidth: 1,
      },
    ],
  });
  const [macronutrientData, setMacronutrientData] = useState({
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#6C63FF', '#FF6F61', '#FFC107'],
        hoverBackgroundColor: ['#4B44CC', '#FF4B41', '#FF9E00'],
      },
    ],
  });
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchLast7DaysLogs = async () => {
      if (!uid) return;
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        const days = [];
        const calorieValues = [];
        let totalCalories = 0;
        let totalProteins = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        // Generate dates for last 7 days (June 9 to June 15, 2025)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
          const dayAbbr = date.toLocaleDateString("en-US", { weekday: "short" });
          days.push(dayAbbr);

          // Fetch logs for each day
          console.log(`🔍 Fetching logs for UID: ${uid}, Date: ${formattedDate}`);
          const response = await apiClient.get(`/diet-logs/user/${uid}?log_date=${formattedDate}`);
          console.log(`🔍 API Response for ${formattedDate}:`, response.data);
          const logs = response.data.logs || [];
          const calories = logs.length > 0 ? Number(logs[0].total_calories) || 0 : 0;
          const proteins = logs.length > 0 ? Number(logs[0].proteins) || 0 : 0;
          const carbs = logs.length > 0 ? Number(logs[0].carbs) || 0 : 0;
          const fats = logs.length > 0 ? Number(logs[0].fats) || 0 : 0;

          calorieValues.push(calories);
          totalCalories += calories;
          totalProteins += proteins;
          totalCarbs += carbs;
          totalFats += fats;
        }

        // Update calorieData
        setCalorieData({
          labels: days,
          datasets: [
            {
              label: 'Calories (kcal)',
              data: calorieValues,
              backgroundColor: 'rgba(75, 156, 211, 0.5)',
              borderColor: 'rgba(75, 156, 211, 1)',
              borderWidth: 1,
            },
          ],
        });

        // Calculate macronutrient percentages
        let proteinPercent = 0;
        let carbsPercent = 0;
        let fatPercent = 0;
        if (totalCalories > 0) {
          proteinPercent = Math.round((totalProteins * 4 / totalCalories) * 100);
          carbsPercent = Math.round((totalCarbs * 4 / totalCalories) * 100);
          fatPercent = Math.round((totalFats * 9 / totalCalories) * 100);
          // Normalize to ensure sum is ~100%
          const totalPercent = proteinPercent + carbsPercent + fatPercent;
          if (totalPercent !== 100) {
            const diff = 100 - totalPercent;
            fatPercent += diff; // Adjust fat to balance
          }
        }

        // Update macronutrientData
        setMacronutrientData({
          labels: ['Protein', 'Carbs', 'Fat'],
          datasets: [
            {
              data: [proteinPercent, carbsPercent, fatPercent],
              backgroundColor: ['#6C63FF', '#FF6F61', '#FFC107'],
              hoverBackgroundColor: ['#4B44CC', '#FF4B41', '#FF9E00'],
            },
          ],
        });

        console.log(`🔍 Calorie Data:`, { labels: days, data: calorieValues });
        console.log(`🔍 Macronutrient Data:`, { proteinPercent, carbsPercent, fatPercent });
      } catch (err) {
        console.error("❌ Error fetching diet logs:", err.response?.data || err.message);
        setError("Failed to load nutrition stats. Please try again.");
      }
    };

    fetchLast7DaysLogs();
  }, [uid]);

  // Cleanup function for chart destruction on component unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        const chartInstance = chartRef.current.chartInstance;
        if (chartInstance) {
          chartInstance.destroy();
        }
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FaBowlFood className="text-3xl sm:text-4xl text-[#4B9CD3]" />
        <h1 className="text-2xl sm:text-4xl font-bold text-black px-0.5">
          Nutrition Stats
        </h1>
      </div>
      <p className="text-gray-700 mt-2 text-sm sm:text-lg">
        Track your nutritional intake over time and get insights into your macronutrient distribution.
      </p>

      {/* Three Feature Boxes */}
      <div className="flex justify-between items-center gap-3 mt-5 text-xs sm:text-sm">
        <div
          className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
          onClick={() => navigate("/diet")}
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
        >
          Nutrition Stats
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Nutrition Statistics Card */}
      <div className="mt-8 bg-white shadow-lg rounded-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5">
          Calorie Intake (Last 7 Days)
        </h3>

        {/* Bar Chart for Calorie Intake */}
        <Bar
          ref={chartRef}
          data={calorieData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Daily Calorie Intake',
                font: {
                  size: 16,
                },
              },
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 500,
                },
              },
            },
          }}
        />
      </div>

      {/* Macronutrient Distribution Card */}
      <div className="mt-8 bg-white shadow-lg rounded-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5">
          Macronutrient Distribution
        </h3>

        {/* Pie Chart for Macronutrient Distribution */}
        <Pie
          ref={chartRef}
          data={macronutrientData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Macronutrient Breakdown',
                font: {
                  size: 16,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Nutrition;
