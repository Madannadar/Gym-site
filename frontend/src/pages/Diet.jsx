import { FaBowlFood, FaPlus, FaMagnifyingGlass } from "react-icons/fa6";
import DietCard from "../components/DietCard";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Diet = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [followedPlan, setFollowedPlan] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const dietPlans = [
    {
      name: "Weight Loss Plan",
      description: "A balanced plan designed for sustainable weight loss.",
      calories: "1500 kcal",
      meals: "3",
      difficulty: "Medium",
      protein: "80",
      carbs: "150",
      fats: "50",
    },
    {
      name: "Muscle Building Plan",
      description: "High protein plan to support muscle growth and recovery.",
      calories: "2500 kcal",
      meals: "4",
      difficulty: "Hard",
      protein: "200",
      carbs: "300",
      fats: "80",
    },
    {
      name: "Maintenance Diet",
      description: "A diet to maintain your current physique and energy levels.",
      calories: "2000 kcal",
      meals: "3",
      difficulty: "Easy",
      protein: "120",
      carbs: "250",
      fats: "70",
    },
    {
      name: "Vegetarian Plan",
      description: "A plant-based plan with balanced nutrition and protein sources.",
      calories: "1800 kcal",
      meals: "3",
      difficulty: "Medium",
      protein: "100",
      carbs: "220",
      fats: "60",
    },
  ];

  // Check for custom plan from navigation state
  useEffect(() => {
    if (location.state?.followedPlan) {
      setFollowedPlan(location.state.followedPlan);
    }
  }, [location.state]);

  const handleCreateCustomPlan = () => {
    navigate("/custom-diet");
  };

  const handleFollowPlan = (plan) => {
    setFollowedPlan(plan);
  };

  const handleUnfollowPlan = () => {
    setFollowedPlan(null);
  };

  const filteredPlans = dietPlans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!followedPlan || plan.name !== followedPlan.name)
  );

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

      {/* Feature Boxes */}
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

      {/* Followed Plan */}
      {followedPlan && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Plan</h3>
          <DietCard
            name={followedPlan.name}
            description={followedPlan.description}
            calories={followedPlan.calories}
            meals={followedPlan.meals}
            difficulty={followedPlan.difficulty}
            protein={followedPlan.protein}
            carbs={followedPlan.carbs}
            fats={followedPlan.fats}
            onFollow={handleUnfollowPlan}
            isFollowed={true}
          />
        </div>
      )}

      {/* Explore Plans Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Explore Plans</h3>
        {/* Search Bar & Create Plan Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Search diet plans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base" />
          </div>
          <button
            onClick={handleCreateCustomPlan}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4B9CD3] text-white rounded-lg text-sm w-full sm:w-auto hover:bg-blue-600 transition-all duration-200"
          >
            <FaPlus /> Create Custom Plan
          </button>
        </div>

        {/* Diet Templates */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan, index) => (
              <DietCard
                key={index}
                name={plan.name}
                description={plan.description}
                calories={plan.calories}
                meals={plan.meals}
                difficulty={plan.difficulty}
                protein={plan.protein}
                carbs={plan.carbs}
                fats={plan.fats}
                onFollow={() => handleFollowPlan(plan)}
                isFollowed={false}
              />
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-full">
              No diet plans found matching "{searchTerm}".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diet;
