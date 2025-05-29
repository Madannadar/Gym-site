import { FaBowlFood } from "react-icons/fa6"; // FaBowlFood from fa6
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Bar } from "react-chartjs-2"; // Import Bar chart for calorie intake
import { Pie } from "react-chartjs-2"; // Import Pie chart for macronutrient distribution
import { useEffect, useRef } from 'react'; // Import useRef and useEffect for cleanup
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Nutrition = () => {
  const navigate = useNavigate();

  // Sample data for Bar chart (Calorie Intake)
  const calorieData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Days of the week
    datasets: [
      {
        label: 'Calories (kcal)',
        data: [2200, 2000, 1800, 2300, 2100, 1900, 2400], // Example calorie values
        backgroundColor: 'rgba(75, 156, 211, 0.5)',
        borderColor: 'rgba(75, 156, 211, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Sample data for Pie chart (Macronutrient Distribution)
  const macronutrientData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [30, 50, 20], // Example macronutrient percentages
        backgroundColor: ['#6C63FF', '#FF6F61', '#FFC107'],
        hoverBackgroundColor: ['#4B44CC', '#FF4B41', '#FF9E00'],
      },
    ],
  };

  // Create a reference to the chart for cleanup
  const chartRef = useRef(null);

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
        <h1 className="text-2xl sm:text-4xl font-bold text-black">
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
