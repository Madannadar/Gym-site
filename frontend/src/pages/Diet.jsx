import { FaBowlFood, FaPlus } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import DietCard from "../components/DietCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import weightLossMeal from "../assets/weightLossMeal.png";
import muscleBuildingMeal from "../assets/muscleBuildingMeal.png";
import maintenanceDietMeal from "../assets/maintenanceDietMeal.png";
import vegetarianPlanMeal from "../assets/vegetarianPlanMeal.png";

const Diet = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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
        <div className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out">
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
          onClick={() => navigate("/nutrition")}
        >
          Nutrition Stats
        </div>
      </div>

      {/* Search Bar & Create Plan Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
        {/* Search Bar */}
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search diet plans"
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base" />
        </div>

        {/* Create Custom Plan Button */}
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4B9CD3] text-white rounded-lg text-sm w-full sm:w-auto hover:bg-blue-600 transition-all duration-200">
          <FaPlus /> Create Custom Plan
        </button>
      </div>

      {/* Show Search Term */}
      {searchTerm && <p className="text-gray-600 mt-1 text-xs text-center">Searching for: {searchTerm}</p>}

      {/* Diet Templates */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <DietCard 
          image={weightLossMeal} 
          name="Weight Loss Plan" 
          description="A balanced plan designed for sustainable weight loss." 
          calories="1500 kcal" 
          meals="3" 
          difficulty="Medium" 
        />
        <DietCard 
          image={muscleBuildingMeal} 
          name="Muscle Building Plan" 
          description="High protein plan to support muscle growth and recovery." 
          calories="2500 kcal" 
          meals="4" 
          difficulty="Hard" 
        />
        <DietCard 
          image={maintenanceDietMeal} 
          name="Maintenance Diet" 
          description="A diet to maintain your current physique and energy levels." 
          calories="2000 kcal" 
          meals="3" 
          difficulty="Easy" 
        />
        <DietCard 
          image={vegetarianPlanMeal} 
          name="Vegetarian Plan" 
          description="A plant-based plan with balanced nutrition and protein sources." 
          calories="1800 kcal" 
          meals="3" 
          difficulty="Medium" 
        />
      </div>
    </div>
  );
};

export default Diet;
