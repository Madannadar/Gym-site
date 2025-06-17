import { FaBowlFood, FaPlus, FaMagnifyingGlass } from "react-icons/fa6";
import DietCard from "../components/DietCard";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

const Diet = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [followedPlan, setFollowedPlan] = useState(null);
  const [dietPlans, setDietPlans] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { uid, authenticated } = useAuth();

  useEffect(() => {
    if (location.state?.followedPlan) {
      setFollowedPlan(location.state.followedPlan);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchDietPlans = async () => {
      if (!authenticated) {
        setError("Please log in to view diet plans.");
        console.error("User not authenticated");
        return;
      }
      if (!uid || isNaN(parseInt(uid))) {
        setError("Invalid user ID.");
        console.error("Invalid UID:", uid);
        return;
      }
      try {
        console.log("Fetching all diet templates");
        const response = await apiClient.get(`/diet-templets`);
        console.log("Diet templates response:", response.data);
        setDietPlans(response.data.templates || []);

        const userId = parseInt(uid);
        console.log("Fetching user data for ID:", userId);
        try {
          const userResponse = await apiClient.get(`/users/me`);
          console.log("User response:", userResponse.data);
          if (userResponse.data?.user?.selected_template_id) {
            console.log(
              "Fetching selected template ID:",
              userResponse.data.user.selected_template_id
            );
            const templateResponse = await apiClient.get(
              `/diet-templets/${userResponse.data.user.selected_template_id}`
            );
            console.log("Selected template response:", templateResponse.data);
            setFollowedPlan(templateResponse.data.template);
          }
        } catch (userErr) {
          console.error("Error fetching user data:", userErr.response?.data || userErr);
          setError("Failed to load user data. You can still explore diet plans.");
        }
      } catch (err) {
        console.error("Error fetching diet plans:", err.response?.data || err);
        setError("Failed to load diet plans. Check console for details.");
      }
    };
    fetchDietPlans();
  }, [uid, authenticated]);

  const handleCreateCustomPlan = () => {
    if (!authenticated) {
      setError("Please log in to create a custom plan.");
      return;
    }
    navigate("/custom-diet");
  };

  const handleFollowPlan = async (plan) => {
    if (!authenticated) {
      setError("Please log in to follow a plan.");
      return;
    }
    try {
      const userId = parseInt(uid);
      console.log("Following plan with template ID:", plan.template_id);
      await apiClient.put(`/users/${userId}/template`, {
        selected_template_id: plan.template_id,
      });
      setFollowedPlan(plan);
    } catch (err) {
      console.error("Error following plan:", err.response?.data || err);
      setError("Failed to follow plan.");
    }
  };

  const handleUnfollowPlan = async () => {
    if (!authenticated) {
      setError("Please log in to unfollow a plan.");
      return;
    }
    try {
      const userId = parseInt(uid);
      console.log("Unfollowing plan for user ID:", userId);
      await apiClient.put(`/users/${userId}/template`, {
        selected_template_id: null,
      });
      setFollowedPlan(null);
    } catch (err) {
      console.error("Error unfollowing plan:", err.response?.data || err);
      setError("Failed to unfollow plan.");
    }
  };

  const filteredPlans = dietPlans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!followedPlan || plan.template_id !== followedPlan.template_id)
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <FaBowlFood className="text-3xl sm:text-4xl text-[#4B9CD3]" />
        <h1 className="text-2xl sm:text-4xl font-bold text-black px-0.5">
          Diet Management
        </h1>
      </div>
      <p className="text-gray-700 mt-2 text-sm sm:text-lg">
        Track your nutrition, create meal plans, and achieve your dietary goals
        with our comprehensive diet management tools.
      </p>

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

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {followedPlan && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Plan</h3>
          <DietCard
            name={followedPlan.name}
            description={followedPlan.description}
            calories={`${followedPlan.calories} kcal`}
            meals={followedPlan.number_of_meals || "Unknown"}
            difficulty={followedPlan.difficulty || "Unknown"}
            protein={followedPlan.protein}
            carbs={followedPlan.carbs}
            fats={followedPlan.fats}
            onFollow={handleUnfollowPlan}
            isFollowed={true}
          />
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Explore Plans
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Search diet plans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base" />
          </div>
          <button
            onClick={handleCreateCustomPlan}
            className="flex items-center gap-2 px-4 py-2 bg-[#4B9CD3] text-white rounded-lg text-sm w-full sm:w-auto hover:bg-blue-600 transition-all duration-200"
          >
            <FaPlus /> Create Custom Plan
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <DietCard
                key={plan.template_id}
                name={plan.name}
                description={plan.description}
                calories={`${plan.calories} kcal`}
                meals={plan.number_of_meals || "Unknown"}
                difficulty={plan.difficulty || "Unknown"}
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
