import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import { Trash2 } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { Play } from 'lucide-react';
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
  const [error, setError] = useState("");  //--
  const [recentRegiments, setRecentRegiments] = useState([]);
  // const [exerciseNames, setExerciseNames] = useState({});
  const [currentPlannedRegiments, setCurrentPlannedRegiments] = useState([]);
  const [completedRegiments, setCompletedRegiments] = useState([]);
  const [completedWorkoutIds, setCompletedWorkoutIds] = useState(new Set());

  const navigate = useNavigate();
  const { uid } = useAuth();
  const userId = Number(uid);

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
      if (!completedWorkouts) return false; // ✅ skip if user has never logged any workout from this regiment

      const allWorkouts = reg.workout_structure.map((w) => w.workout_id);

      // ✅ include only if some workouts are *not* completed
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

      // ✅ Regiment is completed if all its workouts have been logged
      return allWorkoutIds.every((id) => completedWorkouts.has(id));
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regRes = await axios.get(`${API_URL}/workouts/regiments`);
        const regimentsData = regRes.data.items || [];
        setRegiments(regimentsData);

        const recentSystemRegiments = regimentsData
          .filter((r) => Number(r.created_by) !== userId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentRegiments(recentSystemRegiments);

        // 🧠 Collect workout IDs
        const workoutIds = new Set();
        regimentsData.forEach((reg) => {
          reg.workout_structure.forEach((day) => {
            if (day.workout_id) workoutIds.add(day.workout_id);
          });
        });

        // 🔁 Fetch all workouts and their exercise names
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

        // 📝 Workout names for UI
        const workoutNameMap = {};
        Object.entries(workoutDetailsMap).forEach(([id, workout]) => {
          workoutNameMap[id] = workout.name;
        });
        setWorkoutNames(workoutNameMap);

        // 📚 Workout logs
        const logRes = await axios.get(`${API_URL}/workouts/logs/user/${userId}`);
        const logs = logRes.data.items || [];
        setWorkoutLogs(logs);

        const completedWorkoutIds = new Set(logs.map(log => log.planned_workout_id));

        // 📊 Log counts
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

      // Log the workout details before expanding
      // console.log("Toggling Workout ID:", id);
      // console.log("WorkoutDetails for this ID:", workoutDetails[id]);

      if (!workoutDetails[id]) {
        console.warn(`Workout ID ${id} not found in workoutDetails!`);
      } else {
        workoutDetails[id].structure.forEach((exercise, i) => {
          // console.log(
          //   `Exercise ${i + 1}:`,
          //   exercise.name,
          //   "| weight_unit:",
          //   exercise.weight_unit,
          //   "| time_unit:",
          //   exercise.time_unit,
          //   "| lap_unit:",
          //   exercise.lap_unit
          // );
        });
      }

      setExpandedWorkoutId(id);
    },
    [expandedWorkoutId, workoutDetails]
  );


  const systemRegiments = regiments.filter((r) => Number(r.created_by) !== userId);
  const userRegiments = regiments.filter((r) => Number(r.created_by) === userId);


  const handleDeleteRegiment = async (regimentId, created_by) => {

    if (!window.confirm("Are you sure you want to delete this regiment?")) return;

    try {
      if (created_by === userId) {
        await axios.delete(`${API_URL}/workouts/regiments/${regimentId}`);
        alert("Regiment deleted successfully.");
        window.location.reload();
      }
      // ⬇️ Refresh or refetch regiments here
      // fetchRegiments(); // replace with your actual fetch function
    } catch (err) {
      console.error("Failed to delete regiment:", err);
      alert("Failed to delete regiment. Please try again.");
    }
  };


  const renderRegimentCard = (regiment, includeLogCount = true, workoutDetails) => (
    <div
      key={regiment.regiment_id}
      className="bg-white shadow rounded-lg mb-4 p-1 border"
    >
      <h2
        className="text-xl font-semibold cursor-pointer text-[#4B9CD3] hover:text-blue-500 flex flex-col sm:flex-row sm:items-center sm:justify-between"
        onClick={() => toggleRegiment(regiment.regiment_id)}
      >
        <span>{regiment.name}</span>
        <div className="text-sm text-gray-500 mt-1 sm:mt-0 sm:ml-4 italic">
          {Number(regiment.created_by) === userId
            ? "Created by you"
            : `Created by ${regiment.created_by_name || "someone"}`}
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Intensity: {regiment.intensity || "N/A"})
          </span>

          {includeLogCount && (
            <span className="ml-2 not-italic">(Logged {logCounts[regiment.regiment_id] || 0} times)</span>
          )}
        </div>
      </h2>

      {/* 💡 Action buttons */}
      {/* {Number(regiment.created_by) === userId && (
        <div className="mt-2 flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => navigate(`/workouts/regiments/${regiment.regiment_id}`)}
            className="flex items-center gap-1 text-sm px-4 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all duration-200"
          >
            <Pencil className="h-4 w-4" /> Update
          </button>

          <button
            onClick={() => handleDeleteRegiment(regiment.regiment_id, regiment.created_by)}
            className="flex items-center gap-1 text-sm px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>

      )} */}
      {expandedRegimentId === regiment.regiment_id && (
        <div className="mt-3 space-y-2">
          {Number(regiment.created_by) === userId && (
            <div className="mb-2 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => navigate(`/workouts/regiments/${regiment.regiment_id}`)}
                className="flex items-center gap-1 text-sm px-4 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all duration-200"
              >
                <Pencil className="h-4 w-4" /> Update
              </button>

              <button
                onClick={() => handleDeleteRegiment(regiment.regiment_id, regiment.created_by)}
                className="flex items-center gap-1 text-sm px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
          {regiment.workout_structure.map((day) => (
            <div key={day.workout_id} className="space-y-1">
              <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                <div
                  className="flex-1 text-[#4B9CD3] cursor-pointer hover:text-blue-500 underline text-sm sm:text-base"
                  onClick={() => toggleWorkout(day.workout_id)}
                >
                  <p className="font-medium">
                    {day.name} - {workoutNames[day.workout_id] || "Loading..."}
                    <span className="ml-2 text-sm text-gray-500 italic">
                      (Score: {workoutDetails[day.workout_id]?.score || "N/A"})
                    </span>
                    {completedWorkoutIds.has(day.workout_id) && (
                      <span className="ml-2 text-green-600 font-semibold">✅ Completed</span>
                    )}
                  </p>

                </div>

                <button
                  onClick={() => navigate(`/start-workout/${regiment.regiment_id}/${day.workout_id}`)}
                  className="flex-shrink-0 flex items-center gap-1 text-sm px-4 py-1.5 bg-[#4B9CD3] text-white rounded-md hover:bg-blue-600 transition-all duration-200"
                >
                  <Play className="h-4 w-4"/> Start
                </button>
              </div>
              {expandedWorkoutId === day.workout_id && (
                <div className="mt-2 bg-gray-50 p-3 rounded border">
                  <h4 className="text-gray-700 font-semibold mb-2">Exercises:</h4>

                  <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scrollbar-hide py-2">
                    {workoutDetails[day.workout_id]?.structure?.length > 0 ? (
                      workoutDetails[day.workout_id].structure.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="min-w-full sm:min-w-[300px] p-3 border rounded bg-white shadow-sm flex-shrink-0 snap-center"
                        >
                          <p className="text-blue-700 font-medium text-lg mb-2">
                            🔹 {exercise.name}
                          </p>

                          {exercise.sets && Object.keys(exercise.sets).length > 0 ? (
                            <ul className="ml-2 text-sm text-gray-800 list-disc space-y-1">
                              {Object.values(exercise.sets).map((set, i) => {
                                const parts = [];

                                if (set.reps) parts.push(`${set.reps} reps`);
                                if (set.weight) parts.push(`${set.weight}${exercise.weight_unit || "kg"}`);
                                if (set.time) parts.push(`${set.time}${exercise.time_unit || " sec"}`);
                                if (set.laps) parts.push(`${set.laps} lap${set.laps > 1 ? "s" : ""}${exercise.laps_unit ? ` of ${exercise.laps_unit}` : ""}`);

                                return <li key={i}>{parts.join(", ")}</li>;
                              })}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm ml-2">No sets defined</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No exercises found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLogCard = (regiment, logs, workoutDetails) => (
    <div
      key={regiment.regiment_id}
      className="bg-white shadow rounded-lg mb-4 p-1 border"
    >
      <h2
        className="text-xl font-semibold cursor-pointer text-[#4B9CD3] hover:text-blue-500 "
        onClick={() => toggleRegiment(regiment.regiment_id)}
      >
        {regiment.name}
        <span className="text-sm text-gray-500 ml-2">({logs.length} logs)</span>
      </h2>

      {expandedRegimentId === regiment.regiment_id && (
        <div className="mt-3 space-y-4">
          {logs
            .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
            .map((log) => (
              <div
                key={log.workout_log_id}
                className="p-3 border rounded-md bg-gray-50"
              >
                <p><strong>Date:</strong> {new Date(log.log_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}</p>

                <p>
                  <strong>Workout:</strong> {log.planned_workout_name}
                </p>
                <p>
                  <strong>Score:</strong> {log.score}
                </p>

                {log.actual_workout?.length > 0 ? (
                  <div className="mt-2">
                    <h4 className="font-semibold text-gray-700 mb-2">Exercises:</h4>

                    {/* 💡 Horizontal scrollable list of exercises */}
                    <div className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory">
                      {log.actual_workout.map((actualExercise, index) => {
                        const plannedWorkout = workoutDetails[log.planned_workout_id];
                        const plannedExercise = plannedWorkout?.structure?.find(
                          (ex) => ex.exercise_id === actualExercise.exercise_id
                        );

                        return (
                          <div
                            key={index}
                            className="min-w-full sm:min-w-[250px] p-3 border rounded bg-white shadow-sm flex-shrink-0 snap-center"
                          >
                            <p className="font-semibold text-[#4B9CD3] mb-1 text-lg">
                              {plannedExercise?.name || `Exercise ${actualExercise.exercise_id}`}
                            </p>

                            {(plannedExercise?.sets || actualExercise.sets) ? (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-semibold text-green-600 mb-1">Planned</p>
                                  <ul className="list-disc ml-4">
                                    {Object.entries(plannedExercise?.sets || {}).map(([setKey, set]) => (
                                      <li key={setKey}>
                                        {set.reps ? `${set.reps} reps ` : ""}
                                        {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg"}` : ""}
                                        {set.time ? `${set.time} sec ` : ""}
                                        {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <p className="font-semibold text-blue-600 mb-1">Actual</p>
                                  <ul className="list-disc ml-4">
                                    {Object.entries(actualExercise.sets || {}).map(([setKey, set]) => (
                                      <li key={setKey}>
                                        {set.reps ? `${set.reps} reps ` : ""}
                                        {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg"}` : ""}
                                        {set.time ? `${set.time} sec ` : ""}
                                        {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 ml-4">No set data available</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    No actual workout data recorded.
                  </p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-[#4B9CD3]">Workout Manager</h1>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/create-regiment")}
          className="bg-[#4B9CD3] text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Create Regiment
        </button>
        <button
          onClick={() => setShowLogs((prev) => !prev)}
          className="bg-[#4B9CD3] text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          {showLogs ? "View Regiments" : "View Workout Logs"}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <input
        type="text"
        placeholder="Search by regiment name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded w-full"
      />

      {!showLogs && (
        <>
          {!showLogs && (
            <>
              <h2 className="text-2xl font-bold mb-2 text-orange-600">
                Current Planned Regiments
              </h2>
              {currentPlannedRegiments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentPlannedRegiments
                    .filter((r) =>
                      r.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((regiment) => renderRegimentCard(regiment, true, workoutDetails))}
                </div>
              ) : (
                <p className="text-gray-500 italic mb-4">No regiments present here.</p>
              )}
            </>
          )}
          {!showLogs && (
            <>
              <h2 className="text-2xl font-bold mb-2 text-green-600">
                Completed Regiments
              </h2>
              {completedRegiments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {completedRegiments
                    .filter((r) =>
                      r.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((regiment) => renderRegimentCard(regiment, true, workoutDetails))}
                </div>
              ) : (
                <p className="text-gray-500 italic mb-4">No regiments present here.</p>
              )}
            </>
          )}
          <h2 className="text-2xl font-bold mb-2 text-purple-600">
            Recommended Regiments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentRegiments
              .filter((r) =>
                !currentPlannedIds.has(r.regiment_id) &&
                !completedIds.has(r.regiment_id)
              )
              .filter((r) =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((regiment) => renderRegimentCard(regiment, true, workoutDetails))}

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userRegiments
              .filter((r) =>
                !currentPlannedIds.has(r.regiment_id) &&
                !completedIds.has(r.regiment_id) &&
                !recentRegiments.some(rr => rr.regiment_id === r.regiment_id)
              )
              .filter((r) =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((regiment) => renderRegimentCard(regiment, false, workoutDetails))}
          </div>
        </>
      )}

      {showLogs && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-purple-600">
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
  );
};

export default Workout_Management;
