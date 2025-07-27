import { useNavigate, useLocation } from "react-router-dom";
import { FaDumbbell, FaQrcode } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useMeals } from "../context/MealContext";
import { useAuth } from "../AuthProvider";
import { apiClient } from "../AxiosSetup";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaAngleRight,
  FaPlay,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useTodaysWorkout } from "../components/workout/useWorkout.js";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uid, authenticated } = useAuth();
  const { mealNutritionData } = useMeals();
  const [nutritionSummary, setNutritionSummary] = useState([
    { label: "Calories", value: "0 kcal", percent: 0 },
    { label: "Protein", value: "0g", percent: 0 },
    { label: "Carbs", value: "0g", percent: 0 },
    { label: "Fat", value: "0g", percent: 0 },
  ]);
  const [consumedMeals, setConsumedMeals] = useState([]);
  const [dietTargets, setDietTargets] = useState({
    calories: 2400,
    protein: 165,
    carbs: 275,
    fat: 100,
  });
  const [error, setError] = useState(null);
  const [twoevents, setTwoEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Mock data for other widgets
  const attendanceData = { total: 5 };

  // Use the workout hook - REPLACE all your workout-related states with this

  const editEvents = (data) => {
    if (!data || data.length === 0) {
      setTwoEvents([]);
      return;
    }

    // const Two = data.slice(0, 2);
    const firstTwo = data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const Two = firstTwo.slice(0, 2);
    console.log("First Two Events:", Two);
    setTwoEvents(Two);

  };

  const fetchEvents = async () => {

    try {
      const response = await apiClient.get(`/events`);
      const data = response.data.events || null;
      console.log(data);
      editEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events.");
    }
  };

  const detailModal = (eventId) => {
    const event = twoevents.find((evt) => evt.event_id === eventId);
    setSelectedEvent(event);
    setOpen(true);
  };

  const fetchDietTemplateAndMeals = async () => {
    if (!authenticated || !uid || isNaN(parseInt(uid))) {
      setError("Please log in to view diet data.");
      return;
    }

    try {
      setError(null);

      // Fetch selected diet template
      let fetchedDietTargets = { ...dietTargets }; // Fallback to static values
      try {
        const userResponse = await apiClient.get("/users/me");
        const selectedTemplateId = userResponse.data.user?.selected_template_id;
        if (selectedTemplateId) {
          const templateResponse = await apiClient.get(
            `/diet-templets/${selectedTemplateId}`
          );
          const { calories, protein, carbs, fats } =
            templateResponse.data.template;
          fetchedDietTargets = {
            calories: Number(calories) || 2400,
            protein: Number(protein) || 165,
            carbs: Number(carbs) || 275,
            fat: Number(fats) || 100,
          };
          setDietTargets(fetchedDietTargets);
        } else {
          console.warn(
            `⚠️ No selected diet template for user ${uid}, using defaults`
          );
          setError("No diet plan selected. Using default values.");
        }
      } catch (dietErr) {
        console.error(
          "❌ Error fetching diet template:",
          dietErr.response?.data || dietErr.message
        );
        setError("Failed to load diet plan. Using default values.");
      }

      // Fetch today's meals
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const response = await apiClient.get(
        `/diet-logs/user/${uid}?log_date=${today}`
      );
      const logs = response.data.logs || [];

      const meals = await Promise.all(
        logs.flatMap((log) =>
          ["breakfast", "lunch", "dinner", "snacks"].flatMap(async (type) => {
            if (!log[type]) return [];
            const mealType = type.charAt(0).toUpperCase() + type.slice(1);
            const items = log[type];
            return Promise.all(
              items.map(async (item) => {
                let dishName = item.dish_name;
                let dishId = item.dish_id;

                // Resolve missing dishName or dishId
                if (dishId && !dishName) {
                  const cachedDish = Object.values(
                    mealNutritionData[mealType] || {}
                  ).find((d) => d.id === dishId);
                  if (cachedDish) {
                    dishName = cachedDish.name;
                  } else {
                    try {
                      const dishResponse = await apiClient.get(
                        `/dishes/${dishId}`
                      );
                      dishName = dishResponse.data.dish?.dish_name || "Unknown";
                    } catch (err) {
                      console.error(`Error fetching dish ${dishId}:`, err);
                    }
                  }
                } else if (!dishId && dishName) {
                  const cachedDish = Object.values(
                    mealNutritionData[mealType] || {}
                  ).find((d) => d.name === dishName);
                  if (cachedDish) {
                    dishId = cachedDish.id;
                  } else {
                    try {
                      const dishResponse = await apiClient.get(
                        `/dishes_id?name=${encodeURIComponent(dishName)}`
                      );
                      dishId = dishResponse.data.dish?.dish_id || null;
                    } catch (err) {
                      console.error(
                        `Error fetching dish ID for ${dishName}:`,
                        err
                      );
                    }
                  }
                }

                return {
                  type: mealType,
                  meal: dishName || "Unknown",
                  dish_name: dishName || "Unknown",
                  dish_id: dishId || null,
                  actual_calories: Number(item.actual_calories) || 0,
                  proteins: Number(item.proteins) || 0,
                  carbs: Number(item.carbs) || 0,
                  fats: Number(item.fats) || 0,
                  quantity: Number(item.quantity) || 1,
                };
              })
            );
          })
        )
      );

      // Calculate nutritional summary
      const totals = meals.flat().reduce(
        (acc, meal) => ({
          calories: acc.calories + (Number(meal.actual_calories) || 0),
          protein: acc.protein + (Number(meal.proteins) || 0),
          carbs: acc.carbs + (Number(meal.carbs) || 0),
          fat: acc.fat + (Number(meal.fats) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setNutritionSummary([
        {
          label: "Calories",
          value: `${totals.calories} kcal`,
          percent: Math.min(
            Math.round((totals.calories / fetchedDietTargets.calories) * 100),
            100
          ),
        },
        {
          label: "Protein",
          value: `${totals.protein}g`,
          percent: Math.min(
            Math.round((totals.protein / fetchedDietTargets.protein) * 100),
            100
          ),
        },
        {
          label: "Carbs",
          value: `${totals.carbs}g`,
          percent: Math.min(
            Math.round((totals.carbs / fetchedDietTargets.carbs) * 100),
            100
          ),
        },
        {
          label: "Fat",
          value: `${totals.fat}g`,
          percent: Math.min(
            Math.round((totals.fat / fetchedDietTargets.fat) * 100),
            100
          ),
        },
      ]);

      // Generate consumed meals
      const mealGroups = meals.flat().reduce((acc, meal) => {
        const existing = acc.find((m) => m.name === meal.type);
        if (existing) {
          existing.detail += `, ${meal.dish_name}`;
        } else {
          acc.push({ name: meal.type, detail: meal.dish_name });
        }
        return acc;
      }, []);

      // Ensure all meal types are included, even if empty
      const allMealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
      const consumedMeals = allMealTypes.map((type) => {
        const group = mealGroups.find((m) => m.name === type);
        return {
          name: type,
          detail: group ? group.detail : "None",
        };
      });

      setConsumedMeals(consumedMeals);
    } catch (err) {
      console.error("Error fetching diet data:", err);
      setError(
        err.response?.status === 401
          ? "Please log in again."
          : "Failed to load diet data."
      );
    }
  };

  const joinEvent = async (eventID) => {
    if (!authenticated || !uid) {
      toast.error("Please log in to join events.");
      return;
    }
    try {
      const response = await apiClient.post("/events/logs", {
        event_id: eventID,
        user_id: parseInt(uid),
        regiment_id: null,
        workout_template_values: null,
        user_score: null,
      });
      toast.success("Successfully joined the event!");
    } catch (e) {
      toast.error(e.response.data.error || e);
    }
  };
  //calculate the days for event
  const getDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const differenceInMs = end - today;
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);
    const wholeDaysDifference = Math.floor(differenceInDays);
    return wholeDaysDifference > 0 ? wholeDaysDifference : "0";
  };

  const getDaystoGo = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diff = event - today;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  };

  useEffect(() => {
    fetchDietTemplateAndMeals();
    fetchEvents();
  }, [location.pathname, uid, authenticated]);

  const handleScanQR = () => {
    navigate("/user-attendance");
  };

  const handleStartWorkout = (e, regimentId, workoutId) => {
    e.stopPropagation();

    if (regimentId && workoutId) {
      navigate(`/start-workout/${regimentId}/${workoutId}`);
    } else if (todaysWorkout && todaysWorkout !== "completed" && todaysWorkout.workoutId) {
      // Fallback to today's workout if specific regiment/workout not provided
      navigate(`/start-workout/${todaysWorkout.regiment.regiment_id}/${todaysWorkout.workoutId}`);
    } else {
      navigate("/workout-management");
    }
  };

  const {
    todaysWorkout,
    isLoading: workoutLoading,
    error: workoutError,
    refreshTodaysWorkout
  } = useTodaysWorkout();

  const renderTodaysWorkout = () => {
    if (workoutLoading) {
      return (
        <div className="h-auto md:h-[100px] flex flex-col md:justify-center">
          <div className="flex items-center justify-center bg-gray-200 text-gray-600 px-4 py-6 rounded-lg">
            <span className="text-sm">Loading workout...</span>
          </div>
        </div>
      );
    }

    if (workoutError) {
      return (
        <div className="h-auto md:h-[100px] flex flex-col md:justify-center">
          <div className="flex flex-col items-center justify-center bg-red-100 text-red-600 px-4 py-6 rounded-lg">
            <span className="text-sm text-center">{workoutError}</span>
            <button
              onClick={refreshTodaysWorkout}
              className="text-xs text-blue-500 hover:underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    if (todaysWorkout === "completed") {
      return (
        <div className="h-auto md:h-[100px] flex flex-col md:justify-center">
          <div className="flex flex-col items-center justify-center bg-green-100 text-green-600 px-4 py-6 rounded-lg">
            <FaCheckCircle className="text-2xl mb-2" />
            <span className="text-sm font-semibold text-center">
              ✅ Workout completed for today!
            </span>
          </div>
        </div>
      );
    }

    if (todaysWorkout && todaysWorkout.workoutDetails) {
      const today = new Date();
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      return (
        <div className="h-auto md:h-[120px] flex flex-col md:justify-center">
          <div className="bg-blue-500 text-white px-4 py-3 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium mb-1">
                {dayName}, {dateStr}
              </div>
              <div className="text-lg font-bold mb-2">
                {todaysWorkout.workoutDetails.name}
              </div>
              <div className="text-xs opacity-90 mb-3">
                Day {todaysWorkout.workoutIndex + 1} • {todaysWorkout.workoutDetails.structure?.length || 0} exercises
              </div>
              <button
                onClick={handleStartWorkout}
                className="bg-white text-blue-500 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <FaPlay className="text-xs" />
                Start Workout
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="h-auto md:h-[100px] flex flex-col md:justify-center">
        <div className="flex flex-col items-center justify-center bg-gray-100 text-gray-600 px-4 py-6 rounded-lg">
          <span className="text-sm text-center mb-2">
            No workout scheduled for today
          </span>
          <button
            onClick={() => navigate("/workout-management")}
            className="text-blue-500 text-xs hover:underline"
          >
            Browse Workouts
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pt-12">
      {/* Title and Welcome Text */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <FaDumbbell className="text-2xl sm:text-3xl text-[#4B9CD3]" />
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 px-0.5">
            Gym Dashboard
          </h1>
        </div>
        <p className="text-md text-gray-700 mt-2">
          Welcome to your gym. Access all features of gym. Reach your fitness
          goal with ease.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-2 bg-white p-3 rounded-lg shadow-md border border-red-400 text-red-600 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Section */}
        <div
          className="bg-[#4B9CD3] text-white p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-blue-500 transition-all duration-200 flex justify-center items-center h-[140px] sm:h-[200px] lg:row-start-1 lg:col-start-1"
          onClick={handleScanQR}
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaQrcode
                className="text-[70px] sm:text-[90px]"
                style={{ padding: "6px" }}
              />
              <span className="absolute top-0 left-0 border-t-4 border-l-4 border-white w-3 h-3"></span>
              <span className="absolute top-0 right-0 border-t-4 border-r-4 border-white w-3 h-3"></span>
              <span className="absolute bottom-0 left-0 border-b-4 border-l-4 border-white w-3 h-3"></span>
              <span className="absolute bottom-0 right-0 border-b-4 border-r-4 border-white w-3 h-3"></span>
            </div>
            <div className="text-center">
              <h2 className="text-base sm:text-lg font-semibold">
                Get today’s
              </h2>
              <div className="text-xl sm:text-2xl font-bold">Attendance</div>
            </div>
          </div>
        </div>

        {/* Today's Workout */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-default lg:row-start-2 lg:col-start-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            Today's Workout
          </h3>
          {renderTodaysWorkout()}
        </div>

        {/* Today's Meals and Nutritional Summary */}
        <div
          className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer lg:row-span-2 lg:col-start-2"
          onClick={() => navigate("/meal-tracker")}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            Today's Meals
          </h3>
          <ul className="text-gray-600 text-sm space-y-2 mb-6">
            {consumedMeals.map((meal, index) => (
              <li key={index}>
                <span className="font-semibold text-sm sm:text-base text-gray-700">
                  {meal.name}:
                </span>
                <span className="ml-2">{meal.detail}</span>
              </li>
            ))}
          </ul>
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
            Nutritional Summary
          </h4>
          <div className="mt-2 space-y-2 text-xs sm:text-sm text-gray-700">
            {nutritionSummary.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline"
              >
                <div className="flex items-center gap-2 w-full sm:w-3/5">
                  <span className="text-sm sm:text-base text-gray-800">
                    {item.label}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-gray-700">
                    {item.value}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    ({item.percent}%)
                  </span>
                </div>
                <div className="w-full sm:w-2/5 mt-2 sm:mt-0">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
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

        {/* Live Events */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Live Events
            </h3>
            <h4
              className="text-xs md:text-sm text-[#4B9CD3] font-semibold border-2 border-[#4B9CD3] p-2 rounded-full flex justify-center items-center"
              onClick={() => navigate("/events")}
            >
              Explore More <FaAngleRight className="mt-1" />
            </h4>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {twoevents.length > 0
              ? twoevents.map((events, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative">
                    {events.image && (
                      <img
                        className="w-full h-46 sm:h-56 object-cover"
                        src={events.image}
                        alt={events.name}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}

                    {new Date(events.event_date) > new Date() ? (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                        {getDaystoGo(events.event_date)
                          ? `${getDaystoGo(events.event_date)} days to go`
                          : 0}
                      </div>
                    ) : new Date(events.event_end_date) >= new Date() ? (
                      getDays(events.event_end_date) && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                          {getDays(events.event_end_date)
                            ? `${getDays(events.event_end_date)} days left`
                            : "0 days left"}
                        </div>
                      )
                    ) : (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                        <p>Finished</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="text-base font-semibold mb-2">
                      {events.name}
                    </h4>
                    <div className="grid mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-500" />
                          {events.event_date
                            ? new Date(events.event_date).toDateString()
                            : ""}
                        </p>
                        <p className="text-xs text-gray-500 ml-5">
                          {events.event_time
                            ? events.event_time.slice(0, 5)
                            : "NOT SPECIFIED"}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 flex items-baseline gap-1">
                        <FaMapMarkerAlt className="text-gray-500" />
                        {events.event_location}
                      </p>
                      <p className="col-span-2 text-sm font-medium flex items-center gap-1 text-gray-700">
                        <FaUsers className="text-gray-500" />
                        {events.participant_count
                          ? events.participant_count
                          : 0}{" "}
                        participants
                      </p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        className="bg-gray-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-gray-600 transition duration-200"
                        onClick={() => detailModal(events.event_id)}
                      >
                        Details
                      </button>

                      <button
                        className="bg-blue-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-blue-600 transition duration-200"
                        onClick={() => joinEvent(events.event_id)}
                      >
                        Join Event
                      </button>
                    </div>
                  </div>
                </div>
              ))
              : "No live events available at the moment."}
          </div>
        </div>
        {/* Modal Component */}
        {open && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">{selectedEvent.name}</h2>

              <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <FaCalendarAlt className="text-gray-500" />
                Start Date:
              </p>
              <strong className=" text-black">
                {selectedEvent.event_date
                  ? new Date(selectedEvent.event_date).toDateString()
                  : ""}
              </strong>

              <p className="text-md text-black pb-2 pt-2">
                Time:{" "}
                {selectedEvent.event_time
                  ? selectedEvent.event_time.slice(0, 5)
                  : "NOT SPECIFIED"}
              </p>

              <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <FaCalendarAlt className="text-gray-500" />
                End Date:
              </p>
              <strong className=" text-black-50">
                {selectedEvent.event_end_date
                  ? new Date(selectedEvent.event_end_date).toDateString()
                  : "NOT SPECIFIED"}
              </strong>

              <p className="mb-2 pt-2">
                <strong>Description:</strong>{" "}
                {selectedEvent.description || "Not available"}
              </p>

              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;