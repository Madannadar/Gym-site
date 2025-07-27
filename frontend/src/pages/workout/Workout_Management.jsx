import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import { toast, ToastContainer } from 'react-toastify';
import RegimentCard from "../../components/workout/RegimentCard";
import LogCard from "../../components/workout/LogCard";
import { useWorkout } from "../../components/workout/useWorkout";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const Workout_Management = () => {
  // Use the custom hook instead of individual state variables
  const {
    regiments,
    workoutLogs,
    workoutDetails,
    workoutNames,
    currentPlannedRegiments,
    error,
    fetchFullWorkoutData,
    refreshWorkoutData
  } = useWorkout();

  // Local state for UI interactions
  const [logCounts, setLogCounts] = useState({});
  const [expandedRegimentId, setExpandedRegimentId] = useState(null);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [recentRegiments, setRecentRegiments] = useState([]);
  const [completedRegiments, setCompletedRegiments] = useState([]);
  const [completedWorkoutIds, setCompletedWorkoutIds] = useState(new Set());
  const [deletingRegiment, setDeletingRegiment] = useState(null);
  const [incompleteRegiments, setIncompleteRegiments] = useState([]);
  const [showReload, setShowReload] = useState(false);
  const [logLimit, setLogLimit] = useState(5);

  const navigate = useNavigate();
  const { uid } = useAuth();
  const userId = Number(uid);

  const activeRegimentId = currentPlannedRegiments.length > 0 ? currentPlannedRegiments[0].regiment_id : null;


  useEffect(() => {
    if (regiments.length > 0 && workoutLogs.length >= 0) {
      // Calculate log counts
      const counts = {};
      workoutLogs.forEach((log) => {
        counts[log.regiment_id] = (counts[log.regiment_id] || 0) + 1;
      });
      setLogCounts(counts);

      // Get current regiment ID (from currentPlannedRegiments)
      const currentRegimentByLogs = currentPlannedRegiments.length > 0
        ? currentPlannedRegiments[0].regiment_id
        : null;

      // Categorize regiments
      const categorizedRegiments = categorizeRegiments(regiments, workoutLogs, currentRegimentByLogs);

      setIncompleteRegiments(categorizedRegiments.incomplete);
      setCompletedRegiments(categorizedRegiments.completed);
      setRecentRegiments(categorizedRegiments.recent);

      // Store completed workouts (only for current + incomplete regiments)
      const validRegimentIds = new Set([
        ...categorizedRegiments.current.map(r => r.regiment_id),
        ...categorizedRegiments.incomplete.map(r => r.regiment_id),
      ]);

      const validCompletedWorkoutIds = new Set(
        workoutLogs
          .filter(log => validRegimentIds.has(log.regiment_id))
          .map(log => `${log.regiment_id}-${log.planned_workout_id}`)
      );
      setCompletedWorkoutIds(validCompletedWorkoutIds);
    }
  }, [regiments, workoutLogs, currentPlannedRegiments, userId]);

  useEffect(() => {
    fetchFullWorkoutData(logLimit);
  }, [fetchFullWorkoutData, logLimit]);

  const oldestLogDate = workoutLogs.length > 0
    ? new Date(
      [...workoutLogs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0].created_at
    )
    : null;

  const formattedOldestLogDate = oldestLogDate?.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  // const fetchCurrentRegimentWithFallback = async (userId, regiments, logs) => {
  //   try {
  //     const response = await axios.get(`${API_URL}/workouts/user_current_regiment/${userId}`);
  //     const currentId = response.data.regiment_id;

  //     if (currentId) return currentId;
  //     // else silently continue to fallback
  //   } catch (error) {
  //     // Don't log anything — fail silently and fallback
  //   }

  //   // Fallback: use logs to find the most likely current regiment
  //   const logsByRegiment = {};
  //   logs.forEach((log) => {
  //     if (!logsByRegiment[log.regiment_id]) logsByRegiment[log.regiment_id] = [];
  //     logsByRegiment[log.regiment_id].push(log);
  //   });

  //   for (const regiment of regiments) {
  //     const regimentLogs = logsByRegiment[regiment.regiment_id] || [];
  //     const completedWorkoutIds = new Set(regimentLogs.map(log => log.planned_workout_id));
  //     const allWorkoutIds = regiment.workout_structure.map(w => w.workout_id);
  //     const isComplete = allWorkoutIds.every(id => completedWorkoutIds.has(id));

  //     if (!isComplete && regimentLogs.length > 0) {
  //       return regiment.regiment_id;
  //     }
  //   }

  //   return null; // No valid fallback found
  // };


  const categorizeRegiments = (regiments, logs, currentRegimentByLogs) => {
    const current = [];
    const incomplete = [];
    const completed = [];
    const recent = [];

    // Group logs by regiment
    const logsByRegiment = {};
    logs.forEach(log => {
      if (!logsByRegiment[log.regiment_id]) {
        logsByRegiment[log.regiment_id] = [];
      }
      logsByRegiment[log.regiment_id].push(log);
    });

    // Helper function to check if regiment is complete
    const isRegimentComplete = (regiment) => {
      const regimentLogs = logsByRegiment[regiment.regiment_id] || [];
      const completedWorkoutIds = new Set(regimentLogs.map(log => log.planned_workout_id));
      const allWorkoutIds = regiment.workout_structure.map(w => w.workout_id);
      return allWorkoutIds.every(id => completedWorkoutIds.has(id));
    };

    // Helper function to check if regiment has any logs
    const hasLogs = (regiment) => {
      return (logsByRegiment[regiment.regiment_id] || []).length > 0;
    };

    regiments.forEach(regiment => {
      const regimentComplete = isRegimentComplete(regiment);
      const regimentHasLogs = hasLogs(regiment);

      if (regiment.regiment_id === currentRegimentByLogs) {
        // 1. Current planned regiment (from user_current_regiment table)
        current.push(regiment);
      } else if (regimentHasLogs && !regimentComplete) {
        // 2. Incomplete regiment (has logs but not complete)
        incomplete.push(regiment);
      } else if (regimentComplete) {
        // 3. Completed regiment (has complete logs)
        completed.push(regiment);
      } else if (Number(regiment.created_by) !== userId) {
        // 4. Recent/Latest created regiments (system regiments, not user's own)
        recent.push(regiment);
      }
    });

    // Sort recent regiments by creation date (newest first) and limit to 5
    recent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    recent.splice(5); // Keep only first 5

    return { current, incomplete, completed, recent };
  };

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

  const handleDeleteRegiment = async (regimentId, created_by) => {
    if (created_by !== userId) return;

    const toastId = toast(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this regiment?</p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={async () => {
                toast.dismiss(toastId);
                setDeletingRegiment(regimentId);
                try {
                  await axios.delete(`${API_URL}/workouts/regiments/${regimentId}`);
                  setTimeout(() => {
                    // setRegiments((prev) =>
                    //   prev.filter((r) => r.regiment_id !== regimentId)
                    // );
                    setDeletingRegiment(null);
                    toast.success("Regiment deleted successfully.");
                  }, 300);
                } catch (err) {
                  console.error("Failed to delete regiment:", err);
                  toast.error("Failed to delete regiment. Please try again.");
                  setDeletingRegiment(null);
                }
              }}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(toastId)}
              className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const handleMakeCurrentRegiment = async (regiment) => {
    try {
      // Call API to set current regiment
      console.log("Making current:", { id: userId, regiment_id: regiment });
      await axios.post(`${API_URL}/workouts/user_current_regiment`, {
        id: userId,
        regiment_id: regiment
      });
      refreshWorkoutData();
      toast.success("Regiment set as current successfully!");

      // Move current regiment to incomplete if it exists and is not complete
      const previousCurrent = currentPlannedRegiments[0];
      let updatedIncomplete = [...incompleteRegiments];

      if (previousCurrent && previousCurrent.regiment_id !== regiment.regiment_id) {
        const previousLogs = workoutLogs.filter(log => log.regiment_id === previousCurrent.regiment_id);
        const completedWorkoutIds = new Set(previousLogs.map(log => log.planned_workout_id));
        const allWorkoutIds = previousCurrent.workout_structure.map(w => w.workout_id);
        const isPreviousComplete = allWorkoutIds.every(id => completedWorkoutIds.has(id));

        if (!isPreviousComplete && previousLogs.length > 0) {
          // Move to incomplete
          updatedIncomplete.push(previousCurrent);
        }
      }

      // Remove new current regiment from incomplete and completed
      const updatedCompletedRegiments = completedRegiments.filter(r => r.regiment_id !== regiment.regiment_id);
      updatedIncomplete = updatedIncomplete.filter(r => r.regiment_id !== regiment.regiment_id);

      // Update state
      // setCurrentPlannedRegiments([regiment]);
      setIncompleteRegiments(updatedIncomplete);
      setCompletedRegiments(updatedCompletedRegiments);

    } catch (error) {
      console.error("Failed to set current regiment:", error);
      alert("Failed to set current regiment. Please try again.");
    }
  };

  // const removeUserCurrentRegiment = async (userId) => {
  //   try {
  //     const res = await axios.delete(`${API_URL}/workouts/user_current_regiment/${userId}`);

  //     const { message, status } = res.data;

  //     if (status === "partial") {
  //       toast.warning(message);
  //       setShowReload(true);
  //     } else {
  //       toast.success(message || "Removed current regiment");
  //       setShowReload(true);
  //     }

  //   } catch (err) {
  //     console.error("❌ Error removing current regiment:", err);

  //     // Edge case: still treat 200 with custom message
  //     const fallbackMessage = err?.response?.data?.message;
  //     if (
  //       fallbackMessage?.includes("haven’t completed all workouts") ||
  //       fallbackMessage?.includes("use the 'Make Current'")
  //     ) {
  //       alert(fallbackMessage);
  //     } else {
  //       alert("Failed to remove current regiment");
  //     }
  //   }
  // };
  const handleLoadMoreLogs = () => {
    setLogLimit((prev) => prev + 5);

    if (workoutLogs.length > 0) {
      const oldest = [...workoutLogs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

      const formattedDate = new Date(oldest.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      toast.success(`✅ Loaded logs till ${formattedDate}`, {
        position: "bottom-right",
        autoClose: 4000,
      });
    }
  };




  const currentPlannedIds = new Set(currentPlannedRegiments.map(r => r.regiment_id));
  const completedIds = new Set(completedRegiments.map(r => r.regiment_id));
  const systemRegiments = regiments.filter((r) => Number(r.created_by) !== userId);
  const userRegiments = regiments.filter((r) => Number(r.created_by) === userId);
  const incompleteRegimentIds = new Set(incompleteRegiments.map(r => r.regiment_id));


  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 bg-white min-h-screen">
      {showReload && (
        <button
          onClick={() => window.location.reload()}
          className=" bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white px-4 py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium text-center text-sm sm:text-base animate-bounce"
        >
          Reload Now
        </button>
      )}

      <ToastContainer />
      <div className="animate-fadeIn">
        <h1 className="text-4xl font-bold mb-6 text-[#4B9CD3] text-center">
          Workout Manager
        </h1>
        <div className="flex flex-row justify-between items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/create-regiment")}
            className="w-1/2 bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white px-4 py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium text-center text-sm sm:text-base"
          >
            Create Regiment
          </button>

          <button
            onClick={() => setShowLogs((prev) => !prev)}
            className={`w-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium text-center ${showLogs ? "text-sm" : "text-xs sm:text-sm"
              }`}
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
                    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((regiment) => (
                    <RegimentCard
                      key={regiment.regiment_id}
                      regiment={regiment}
                      includeLogCount={true}
                      workoutDetails={workoutDetails}
                      workoutNames={workoutNames}
                      completedWorkoutIds={completedWorkoutIds}
                      currentPlannedRegiments={currentPlannedRegiments}
                      activeRegimentId={activeRegimentId}
                      toggleRegiment={toggleRegiment}
                      expandedRegimentId={expandedRegimentId}
                      toggleWorkout={toggleWorkout}
                      expandedWorkoutId={expandedWorkoutId}
                      userId={userId}
                      handleDeleteRegiment={handleDeleteRegiment}
                      deletingRegiment={deletingRegiment}
                      navigate={navigate}
                      logCounts={logCounts}
                      handleMakeCurrentRegiment={handleMakeCurrentRegiment}
                    />
                  ))}

              </div>
            ) : (
              <p className="text-gray-500 italic mb-6">
                No regiments present here.
              </p>
            )}

            <h2 className="text-2xl font-bold mb-4 text-yellow-600">
              Incomplete Regiments
            </h2>
            {incompleteRegiments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {incompleteRegiments
                  .filter((r) =>
                    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((regiment) => (
                    <RegimentCard
                      key={regiment.regiment_id}
                      regiment={regiment}
                      includeLogCount={true}
                      workoutDetails={workoutDetails}
                      workoutNames={workoutNames}
                      completedWorkoutIds={completedWorkoutIds}
                      currentPlannedRegiments={currentPlannedRegiments}
                      activeRegimentId={activeRegimentId}
                      toggleRegiment={toggleRegiment}
                      expandedRegimentId={expandedRegimentId}
                      toggleWorkout={toggleWorkout}
                      expandedWorkoutId={expandedWorkoutId}
                      userId={userId}
                      handleDeleteRegiment={handleDeleteRegiment}
                      deletingRegiment={deletingRegiment}
                      navigate={navigate}
                      logCounts={logCounts}
                      handleMakeCurrentRegiment={handleMakeCurrentRegiment}
                    />
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 italic mb-6">
                No incomplete regiments.
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
                  .map((regiment) => (
                    <RegimentCard
                      key={regiment.regiment_id}
                      regiment={regiment}
                      includeLogCount={true}
                      workoutDetails={workoutDetails}
                      workoutNames={workoutNames}
                      completedWorkoutIds={completedWorkoutIds}
                      currentPlannedRegiments={currentPlannedRegiments}
                      activeRegimentId={activeRegimentId}
                      toggleRegiment={toggleRegiment}
                      expandedRegimentId={expandedRegimentId}
                      toggleWorkout={toggleWorkout}
                      expandedWorkoutId={expandedWorkoutId}
                      userId={userId}
                      handleDeleteRegiment={handleDeleteRegiment}
                      deletingRegiment={deletingRegiment}
                      navigate={navigate}
                      logCounts={logCounts}
                      handleMakeCurrentRegiment={handleMakeCurrentRegiment}
                    />
                  ))}
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
                    !completedIds.has(r.regiment_id) &&
                    !incompleteRegimentIds.has(r.regiment_id)
                )
                .filter((r) =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((regiment) => (
                  <RegimentCard
                    key={regiment.regiment_id}
                    regiment={regiment}
                    includeLogCount={true}
                    workoutDetails={workoutDetails}
                    workoutNames={workoutNames}
                    completedWorkoutIds={completedWorkoutIds}
                    currentPlannedRegiments={currentPlannedRegiments}
                    activeRegimentId={activeRegimentId}
                    toggleRegiment={toggleRegiment}
                    expandedRegimentId={expandedRegimentId}
                    toggleWorkout={toggleWorkout}
                    expandedWorkoutId={expandedWorkoutId}
                    userId={userId}
                    handleDeleteRegiment={handleDeleteRegiment}
                    deletingRegiment={deletingRegiment}
                    navigate={navigate}
                    logCounts={logCounts}
                    handleMakeCurrentRegiment={handleMakeCurrentRegiment}
                  />
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {userRegiments
                .filter(
                  (r) =>
                    !currentPlannedIds.has(r.regiment_id) &&
                    !completedIds.has(r.regiment_id) &&
                    !recentRegiments.some(
                      (rr) => rr.regiment_id === r.regiment_id
                    ) &&
                    !incompleteRegimentIds.has(r.regiment_id)

                )
                .filter((r) =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((regiment) => (
                  <RegimentCard
                    key={regiment.regiment_id}
                    regiment={regiment}
                    includeLogCount={false}
                    workoutDetails={workoutDetails}
                    workoutNames={workoutNames}
                    completedWorkoutIds={completedWorkoutIds}
                    currentPlannedRegiments={currentPlannedRegiments}
                    activeRegimentId={activeRegimentId}
                    toggleRegiment={toggleRegiment}
                    expandedRegimentId={expandedRegimentId}
                    toggleWorkout={toggleWorkout}
                    expandedWorkoutId={expandedWorkoutId}
                    userId={userId}
                    handleDeleteRegiment={handleDeleteRegiment}
                    deletingRegiment={deletingRegiment}
                    navigate={navigate}
                    logCounts={logCounts}
                    handleMakeCurrentRegiment={handleMakeCurrentRegiment}
                  />
                ))}
            </div>
          </>
        )}
        {/* {todaysWorkout === "completed" ? (
          <p className="text-green-600 font-semibold">✅ You have completed your workout for today!</p>
        ) : todaysWorkout ? (
          <div className="p-4 bg-blue-100 rounded-md shadow">
            <h2 className="text-xl font-bold text-blue-600 mb-2">Today's Workout</h2>
            <p className="text-gray-800 mb-1">
              <strong>Name:</strong> {todaysWorkout.workoutDetails?.name}
            </p>
            <p className="text-gray-700">
              <strong>Day:</strong> Day {todaysWorkout.workoutIndex + 1}
            </p>
          </div>
        ) : (
          <p className="italic text-gray-500">🎉 You've completed all workouts in this regiment!</p>
        )} */}
        {showLogs && (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-purple-600">Workout Logs</h2>
              <button
                onClick={handleLoadMoreLogs}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md shadow-md text-sm"
              >
                Load More Logs
              </button>
            </div>

            {formattedOldestLogDate && (
              <p className="text-sm text-gray-600 mb-4 italic">
                Loaded logs till {formattedOldestLogDate}
              </p>
            )}

            {[...systemRegiments, ...userRegiments]
              .map((regiment) => {
                const logs = workoutLogs
                  .filter((log) => log.regiment_id === regiment.regiment_id)
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                if (logs.length === 0) return null;

                // Attach logs and latest date to each regiment
                return {
                  ...regiment,
                  logs,
                  latestLogDate: logs[0]?.created_at || null,
                };
              })
              .filter(Boolean) // remove nulls (regiments with no logs)
              .sort((a, b) => new Date(b.latestLogDate) - new Date(a.latestLogDate)) // newest log first
              .map((regiment) => (
                <LogCard
                  key={regiment.regiment_id}
                  regiment={regiment}
                  logs={regiment.logs}
                  workoutDetails={workoutDetails}
                  toggleRegiment={toggleRegiment}
                  expandedRegimentId={expandedRegimentId}
                />
              ))}
          </>
        )}

      </div>
    </div>
  );
};

export default Workout_Management;