import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import { Trash2, Pencil, Play, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Workout_Management = () => {
  const [regiments, setRegiments] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [workoutNames, setWorkoutNames] = useState({});
  const [workoutDetails, setWorkoutDetails] = useState({});
  const [logCounts, setLogCounts] = useState({});
  const [expandedRegimentId, setExpandedRegimentId] = useState(null);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [error, setError] = useState("");
  const [recentRegiments, setRecentRegiments] = useState([]);
  const [currentPlannedRegiments, setCurrentPlannedRegiments] = useState([]);
  const [completedRegiments, setCompletedRegiments] = useState([]);
  const [completedWorkoutIds, setCompletedWorkoutIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [deletingRegiment, setDeletingRegiment] = useState(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const navigate = useNavigate();
  const { uid } = useAuth();
  const userId = Number(uid);
  const scrollRef = useRef(null);

  const getCurrentPlannedRegiments = (regiments, logs) => {
    const completedMap = {};

    logs.forEach((log) => {
      if (!completedMap[log.regiment_id]) {
        completedMap[log.regiment_id] = new Set();
      }
      completedMap[log.regiment_id].add(log.planned_workout_id);
    });

    return regiments.filter((reg) => {
      const completedWorkouts = completedMap[reg.regiment_id];
      if (!completedWorkouts) return false;

      const allWorkouts = reg.workout_structure.map((w) => w.workout_id);
      return allWorkouts.some((id) => !completedWorkouts.has(id));
    });
  };

  const getCompletedRegiments = (regiments, logs) => {
    const completedMap = {};

    logs.forEach((log) => {
      if (!completedMap[log.regiment_id]) {
        completedMap[log.regiment_id] = new Set();
      }
      completedMap[log.regiment_id].add(log.planned_workout_id);
    });

    return regiments.filter((reg) => {
      const completedWorkouts = completedMap[reg.regiment_id] || new Set();
      const allWorkoutIds = reg.workout_structure.map((w) => w.workout_id);
      return allWorkoutIds.every((id) => completedWorkouts.has(id));
    });
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const itemWidth = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setVisibleIndex(newIndex);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const regRes = await axios.get(`${API_URL}/workouts/regiments`);
        const regimentsData = regRes.data.items || [];
        setRegiments(regimentsData);

        const recentSystemRegiments = regimentsData
          .filter((r) => Number(r.created_by) !== userId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentRegiments(recentSystemRegiments);

        const workoutIds = new Set();
        regimentsData.forEach((reg) => {
          reg.workout_structure.forEach((day) => {
            if (day.workout_id) workoutIds.add(day.workout_id);
          });
        });

        const workoutDetailsMap = {};
        await Promise.all(
          [...workoutIds].map(async (id) => {
            const res = await axios.get(`${API_URL}/workouts/${id}`);
            const workout = res.data.item;

            const detailedExercises = workout.structure.map((ex) => {
              return {
                ...ex,
                name: ex.exercise_details?.name || `Exercise ${ex.exercise_id}`,
                weight_unit: ex.weight_unit || "",
                time_unit: ex.time_unit || "sec",
                lap_unit: ex.lap_unit || "",
              };
            });
            workoutDetailsMap[id] = { ...workout, structure: detailedExercises };
          })
        );
        setWorkoutDetails(workoutDetailsMap);

        const workoutNameMap = {};
        Object.entries(workoutDetailsMap).forEach(([id, workout]) => {
          workoutNameMap[id] = workout.name;
        });
        setWorkoutNames(workoutNameMap);

        const logRes = await axios.get(`${API_URL}/workouts/logs/user/${userId}`);
        const logs = logRes.data.items || [];
        setWorkoutLogs(logs);

        const completedWorkoutIds = new Set(logs.map(log => log.planned_workout_id));
        setCompletedWorkoutIds(completedWorkoutIds);

        const counts = {};
        logs.forEach((log) => {
          counts[log.regiment_id] = (counts[log.regiment_id] || 0) + 1;
        });
        setLogCounts(counts);

        const inProgress = getCurrentPlannedRegiments(regimentsData, logs);
        setCurrentPlannedRegiments(inProgress);

        const completed = getCompletedRegiments(regimentsData, logs);
        setCompletedRegiments(completed);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_URL, userId]);

  const currentPlannedIds = new Set(currentPlannedRegiments.map(r => r.regiment_id));
  const completedIds = new Set(completedRegiments.map(r => r.regiment_id));

  const toggleRegiment = (id) => {
    setExpandedRegimentId((prev) => (prev === id ? null : id));
    setExpandedWorkoutId(null);
  };

  const toggleWorkout = useCallback(
    (id) => {
      if (expandedWorkoutId === id) {
        setExpandedWorkoutId(null);
        return;
      }

      if (!workoutDetails[id]) {
        console.warn(`Workout ID ${id} not found in workoutDetails!`);
      }

      setExpandedWorkoutId(id);
    },
    [expandedWorkoutId, workoutDetails]
  );

  const systemRegiments = regiments.filter((r) => Number(r.created_by) !== userId);
  const userRegiments = regiments.filter((r) => Number(r.created_by) === userId);

  const handleDeleteRegiment = async (regimentId, created_by) => {
    if (!window.confirm("Are you sure you want to delete this regiment?")) return;

    setDeletingRegiment(regimentId);
    try {
      if (created_by === userId) {
        await axios.delete(`${API_URL}/workouts/regiments/${regimentId}`);

        // Animate removal
        setTimeout(() => {
          setRegiments(prev => prev.filter(r => r.regiment_id !== regimentId));
          setDeletingRegiment(null);
        }, 300);
      }
    } catch (err) {
      console.error("Failed to delete regiment:", err);
      alert("Failed to delete regiment. Please try again.");
      setDeletingRegiment(null);
    }
  };

  const renderRegimentCard = (regiment, includeLogCount = true, workoutDetails) => (
    <div
      key={regiment.regiment_id}
      className={`bg-white shadow-lg rounded-xl mb-6 border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${deletingRegiment === regiment.regiment_id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <div className="p-6">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer group"
          onClick={() => toggleRegiment(regiment.regiment_id)}
        >
          <div className="flex items-center space-x-3">
            <div className="transition-transform duration-300 group-hover:rotate-180">
              {expandedRegimentId === regiment.regiment_id ? (
                <ChevronUp className="h-5 w-5 text-[#4B9CD3]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#4B9CD3]" />
              )}
            </div>
            <h2 className="text-xl font-bold text-[#4B9CD3] group-hover:text-blue-600 transition-colors duration-200">
              {regiment.name}
            </h2>
          </div>

          <div className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4 italic">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                {Number(regiment.created_by) === userId ? "Created by you" : `Created by ${regiment.created_by_name || "someone"}`}
              </span>
              <span className="bg-blue-100 px-2 py-1 rounded-full text-xs text-blue-700">
                Intensity: {regiment.intensity || "N/A"}
              </span>
              {includeLogCount && (
                <span className="bg-green-100 px-2 py-1 rounded-full text-xs text-green-700">
                  Logged {logCounts[regiment.regiment_id] || 0} times
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`transition-all duration-500 ease-in-out ${expandedRegimentId === regiment.regiment_id
          ? 'max-h-[2000px] opacity-100 mt-6'
          : 'max-h-0 opacity-0 mt-0'
          } overflow-hidden`}>
          {Number(regiment.created_by) === userId && (
            <div className="mb-4 flex flex-wrap gap-3 justify-end animate-fadeIn">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/workouts/regiments/${regiment.regiment_id}`);
                }}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Pencil className="h-4 w-4" /> Update
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRegiment(regiment.regiment_id, regiment.created_by);
                }}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}

          <div className="space-y-3">
            {regiment.workout_structure.map((day, index) => (
              <div
                key={day.workout_id}
                className="transform transition-all duration-300 hover:translate-x-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#4B9CD3] transition-all duration-200">
                  <div
                    className="flex-1 cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWorkout(day.workout_id);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      {/* <div className="w-8 h-8 bg-[#4B9CD3] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div> */}
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-[#4B9CD3] transition-colors duration-200">
                          {day.name} - {workoutNames[day.workout_id] || "Loading..."}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="bg-blue-100 px-2 py-1 rounded-full text-xs">
                            Score: {workoutDetails[day.workout_id]?.score || "N/A"}
                          </span>
                          {completedWorkoutIds.has(day.workout_id) && (
                            <span className="bg-green-100 px-2 py-1 rounded-full text-xs text-green-700 animate-pulse">
                              ✅ Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/start-workout/${regiment.regiment_id}/${day.workout_id}`);
                    }}
                    className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <Play className="h-4 w-4" /> Start
                  </button>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${expandedWorkoutId === day.workout_id
                  ? 'max-h-[1000px] opacity-100 mt-4'
                  : 'max-h-0 opacity-0 mt-0'
                  } overflow-hidden`}>
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-100 shadow-inner">
                    <h4 className="text-gray-700 font-semibold mb-3 flex items-center">
                      <span className="w-2 h-2 bg-[#4B9CD3] rounded-full mr-2"></span>
                      Exercises
                    </h4>

                    <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scrollbar-hide py-2">
                      {workoutDetails[day.workout_id]?.structure?.length > 0 ? (
                        workoutDetails[day.workout_id].structure.map((exercise, idx) => (
                          <div
                            key={idx}
                            className="min-w-full sm:min-w-[320px] p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-md flex-shrink-0 snap-center transform transition-all duration-300 hover:shadow-lg hover:scale-105"
                          >
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-[#4B9CD3] to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{idx + 1}</span>
                              </div>
                              <p className="text-[#4B9CD3] font-semibold text-lg">
                                {exercise.name}
                              </p>
                            </div>

                            {exercise.sets && Object.keys(exercise.sets).length > 0 ? (
                              <div className="space-y-2">
                                {Object.values(exercise.sets).map((set, i) => {
                                  const parts = [];
                                  if (set.reps) parts.push(`${set.reps} reps`);
                                  if (set.weight) parts.push(`${set.weight}${exercise.weight_unit || "kg"}`);
                                  if (set.time) parts.push(`${set.time}${exercise.time_unit || " sec"}`);
                                  if (set.laps) parts.push(`${set.laps} lap${set.laps > 1 ? "s" : ""}${exercise.laps_unit ? ` of ${exercise.laps_unit}` : ""}`);

                                  return (
                                    <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                                      <div className="w-6 h-6 bg-[#4B9CD3] rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">{i + 1}</span>
                                      </div>
                                      <span className="text-sm text-gray-700">{parts.join(", ")}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No sets defined</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No exercises found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogCard = (regiment, logs, workoutDetails) => (
    <div
      key={regiment.regiment_id}
      className="bg-white shadow-lg rounded-xl mb-6 border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <div className="p-6">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => toggleRegiment(regiment.regiment_id)}
        >
          <div className="transition-transform duration-300 group-hover:rotate-180">
            {expandedRegimentId === regiment.regiment_id ? (
              <ChevronUp className="h-5 w-5 text-[#4B9CD3]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#4B9CD3]" />
            )}
          </div>
          <h2 className="text-xl font-bold text-[#4B9CD3] group-hover:text-blue-600 transition-colors duration-200">
            {regiment.name}
          </h2>
          <span className="bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-700 font-medium">
            {logs.length} logs
          </span>
        </div>

        <div className={`transition-all duration-500 ease-in-out ${expandedRegimentId === regiment.regiment_id
          ? 'max-h-[2000px] opacity-100 mt-6'
          : 'max-h-0 opacity-0 mt-0'
          } overflow-hidden`}>
          <div className="space-y-4">
            {logs
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .map((log, index) => (
                <div
                  key={log.workout_log_id}
                  className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-white transform transition-all duration-300 hover:shadow-md hover:border-[#4B9CD3]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="font-semibold text-gray-700">Date:</span>
                      <span className="text-gray-600">
                        {new Date(log.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-semibold text-gray-700">Workout:</span>
                      <span className="text-gray-600">{log.planned_workout_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="font-semibold text-gray-700">Score:</span>
                      <span className="bg-yellow-100 px-2 py-1 rounded-full text-sm text-yellow-700 font-medium">
                        {log.score}
                      </span>
                    </div>
                  </div>

                  {log.actual_workout?.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-[#4B9CD3] rounded-full mr-2"></span>
                        Exercises
                      </h4>

                      <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory scrollbar-hide"
                      >
                        {log.actual_workout.map((actualExercise, index) => {
                          const plannedWorkout = workoutDetails[log.planned_workout_id];
                          const plannedExercise = plannedWorkout?.structure?.find(
                            (ex) => ex.exercise_id === actualExercise.exercise_id
                          );

                          return (
                            <div
                              key={index}
                              className="min-w-full sm:min-w-[300px] p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex-shrink-0 snap-center transform transition-all duration-300 hover:shadow-md hover:scale-105"
                            >
                              <p className="font-semibold text-[#4B9CD3] mb-3 text-lg flex items-center">
                                <span className="w-6 h-6 bg-[#4B9CD3] rounded-full flex items-center justify-center mr-2">
                                  <span className="text-white font-bold text-xs">{index + 1}</span>
                                </span>
                                {plannedExercise?.name || `Exercise ${actualExercise.exercise_id}`}
                              </p>

                              {(plannedExercise?.sets || actualExercise.sets) ? (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-semibold text-green-600 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                      Planned
                                    </p>
                                    <div className="space-y-1">
                                      {Object.entries(plannedExercise?.sets || {}).map(([setKey, set]) => (
                                        <div key={setKey} className="p-2 bg-green-50 rounded-md">
                                          {set.reps ? `${set.reps} reps ` : ""}
                                          {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg"}` : ""}
                                          {set.time ? `${set.time} sec ` : ""}
                                          {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="font-semibold text-blue-600 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                      Actual
                                    </p>
                                    <div className="space-y-1">
                                      {Object.entries(actualExercise.sets || {}).map(([setKey, set]) => (
                                        <div key={setKey} className="p-2 bg-blue-50 rounded-md">
                                          {set.reps ? `${set.reps} reps ` : ""}
                                          {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg"}` : ""}
                                          {set.time ? `${set.time} sec ` : ""}
                                          {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm italic">No set data available</p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-center mt-3 gap-1">
                        {log.actual_workout.slice(0, 3).map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${visibleIndex === idx ? 'bg-blue-500 scale-125' : 'bg-gray-300'
                              }`}
                          />
                        ))}
                        {log.actual_workout.length > 3 && visibleIndex >= 3 && (
                          <span className="ml-2 text-sm text-gray-500 font-medium">
                            +{log.actual_workout.length - visibleIndex}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic mt-2">
                      No actual workout data recorded.
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 bg-white min-h-screen">
      <div className="animate-fadeIn">
        <h1 className="text-4xl font-bold mb-6 text-[#4B9CD3] text-center">
          Workout Manager
        </h1>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/create-regiment")}
            className="bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
          >
            Create Regiment
          </button>
          <button
            onClick={() => setShowLogs((prev) => !prev)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
          >
            {showLogs ? "View Regiments" : "View Workout Logs"}
          </button>
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Search by regiment name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-6 p-3 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
        />

        {!showLogs && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-orange-600">
              Current Planned Regiments
            </h2>
            {currentPlannedRegiments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentPlannedRegiments
                  .filter((r) =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((regiment) =>
                    renderRegimentCard(regiment, true, workoutDetails)
                  )}
              </div>
            ) : (
              <p className="text-gray-500 italic mb-6">
                No regiments present here.
              </p>
            )}

            <h2 className="text-2xl font-bold mb-4 text-green-600">
              Completed Regiments
            </h2>
            {completedRegiments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {completedRegiments
                  .filter((r) =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((regiment) =>
                    renderRegimentCard(regiment, true, workoutDetails)
                  )}
              </div>
            ) : (
              <p className="text-gray-500 italic mb-6">
                No regiments present here.
              </p>
            )}

            <h2 className="text-2xl font-bold mb-4 text-purple-600">
              Recommended Regiments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentRegiments
                .filter(
                  (r) =>
                    !currentPlannedIds.has(r.regiment_id) &&
                    !completedIds.has(r.regiment_id)
                )
                .filter((r) =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((regiment) =>
                  renderRegimentCard(regiment, true, workoutDetails)
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {userRegiments
                .filter(
                  (r) =>
                    !currentPlannedIds.has(r.regiment_id) &&
                    !completedIds.has(r.regiment_id) &&
                    !recentRegiments.some(
                      (rr) => rr.regiment_id === r.regiment_id
                    )
                )
                .filter((r) =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((regiment) =>
                  renderRegimentCard(regiment, false, workoutDetails)
                )}
            </div>
          </>
        )}

        {showLogs && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-purple-600">
              Workout Logs
            </h2>
            {[...systemRegiments, ...userRegiments]
              .filter((r) =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((regiment) => {
                const logs = workoutLogs.filter(
                  (log) => log.regiment_id === regiment.regiment_id
                );
                if (logs.length === 0) return null;
                return renderLogCard(regiment, logs, workoutDetails);
              })}
          </>
        )}
      </div>
    </div>
  );
};

export default Workout_Management;