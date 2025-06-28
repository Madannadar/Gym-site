// ✅ UPDATED CODE: Workout_Management.jsx
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";

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
  const [undoData, setUndoData] = useState(null);
  const navigate = useNavigate();
  const { uid } = useAuth();
  const userId = Number(uid);

  const formatDateTime = (isoDateStr) => {
    if (!isoDateStr) return "N/A";
    const dateObj = new Date(isoDateStr);
    const date = dateObj.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${date}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regRes = await axios.get(`${API_URL}/workouts/regiments`);
        const regimentsData = regRes.data.items || [];
        setRegiments(regimentsData);

        const workoutIds = new Set();
        regimentsData.forEach((reg) => {
          reg.workout_structure.forEach((day) => {
            if (day.workout_id) workoutIds.add(day.workout_id);
          });
        });

        const nameMap = {};
        await Promise.all(
          [...workoutIds].map(async (id) => {
            const res = await axios.get(`${API_URL}/workouts/${id}`);
            nameMap[id] = res.data?.item?.name || `Workout ${id}`;
          })
        );
        setWorkoutNames(nameMap);

        const logRes = await axios.get(`${API_URL}/workouts/logs/user/${userId}`);
        const logs = logRes.data.items || [];
        setWorkoutLogs(logs);

        const counts = {};
        logs.forEach((log) => {
          counts[log.regiment_id] = (counts[log.regiment_id] || 0) + 1;
        });
        setLogCounts(counts);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      }
    };

    fetchData();
  }, [API_URL, userId]);

  const toggleRegiment = (id) => {
    setExpandedRegimentId((prev) => (prev === id ? null : id));
    setExpandedWorkoutId(null);
  };

  const toggleWorkout = useCallback(
    async (id) => {
      if (expandedWorkoutId === id) {
        setExpandedWorkoutId(null);
        return;
      }
      if (!workoutDetails[id]) {
        try {
          const res = await axios.get(`${API_URL}/workouts/${id}`);
          setWorkoutDetails((prev) => ({ ...prev, [id]: res.data.item }));
        } catch (err) {
          console.error(err);
          setError("Failed to load workout details.");
        }
      }
      setExpandedWorkoutId(id);
    },
    [expandedWorkoutId, workoutDetails]
  );

  const onStart = async (regimenId, workoutId) => {
    if (!regimenId || !workoutId) return;

    try {
      const regimentRes = await axios.get(`${API_URL}/workouts/regiments/${regimenId}`);
      const regiment = regimentRes.data.item;

      const cleanedStructure = regiment.workout_structure.map((day) => ({
        name: day.name,
        workout_id: day.workout_id,
        status: day.workout_id === Number(workoutId) ? "in_progress" : day.status
      }));

      await axios.put(`${API_URL}/workouts/regiments/${regimenId}`, {
        workout_structure: cleanedStructure
      });

      const updatedRegRes = await axios.get(`${API_URL}/workouts/regiments`);
      setRegiments(updatedRegRes.data.items || []);

      console.log("✅ Regiment structure status updated.");
    } catch (err) {
      console.error("❌ Failed to update regiment structure:", err);
    }
  };

  const handleDeleteRegiment = async (regiment) => {
    const logCount = logCounts[regiment.regiment_id] || 0;
    if (logCount > 0) {
      alert("⚠️ This regiment has workout logs and cannot be deleted.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this regiment?")) {
      try {
        await axios.delete(`${API_URL}/workouts/regiments/${regiment.regiment_id}`);
        setRegiments((prev) => prev.filter((r) => r.regiment_id !== regiment.regiment_id));
        setUndoData({ regiment });
        console.log("🗑️ Regiment deleted.");
      } catch (err) {
        console.error("❌ Failed to delete regiment:", err);
        alert("Failed to delete regiment.");
      }
    }
  };

  const handleUndoDelete = async () => {
    if (!undoData?.regiment) return;
    try {
      await axios.post(`${API_URL}/workouts/regiments`, undoData.regiment);
      setRegiments((prev) => [...prev, undoData.regiment]);
      setUndoData(null);
      console.log("🔁 Regiment restored.");
    } catch (err) {
      console.error("❌ Failed to restore regiment:", err);
      alert("Failed to restore regiment.");
    }
  };

  const currentRegiments = regiments.filter((r) =>
    r.workout_structure.some((d) => d.status === "in_progress")
  );

  const currentRegimentIds = new Set(currentRegiments.map((r) => r.regiment_id));

  const remainingRegiments = regiments.filter((r) => !currentRegimentIds.has(r.regiment_id));

  const systemRegiments = remainingRegiments.filter((r) => Number(r.created_by) !== userId);
  const userRegiments = remainingRegiments.filter((r) => Number(r.created_by) === userId);

  const renderRegimentCard = (regiment, includeLogCount = true) => (
    <div key={regiment.regiment_id} className="bg-white shadow rounded-lg mb-4 p-4 border">
      <h2
        className="text-xl font-semibold cursor-pointer text-[#4B9CD3] hover:text-blue-500"
        onClick={() => toggleRegiment(regiment.regiment_id)}
      >
        {regiment.name}
        {includeLogCount && (
          <span className="text-sm text-gray-500 ml-2">
            (Logged {logCounts[regiment.regiment_id] || 0} times)
          </span>
        )}
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        <strong>Intensity:</strong> {regiment.intensity != null ? regiment.intensity : "N/A"}/10
      </p>

      {expandedRegimentId === regiment.regiment_id && (
        <div className="mt-3 space-y-2 ml-4">
          {Number(regiment.created_by) === userId && (
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => navigate(`/workouts/regiments/${regiment.regiment_id}`)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteRegiment(regiment)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}

          {regiment.workout_structure.map((day, idx) => {
            let icon = "⏳";
            let textColor = "text-gray-600";
            if (day.status === "completed") {
              icon = "✅";
              textColor = "text-green-700";
            } else if (day.status === "in_progress") {
              icon = "🔄";
              textColor = "text-yellow-700 font-semibold";
            }

            return (
              <div key={day.workout_id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between pr-4">
                  <p
                    className={`text-[#4B9CD3] cursor-pointer hover:text-blue-500 underline flex items-center gap-2 ${textColor}`}
                    onClick={() => toggleWorkout(day.workout_id)}
                  >
                    <span>{icon}</span>
                    <span>{day.name} - {workoutNames[day.workout_id] || "Loading..."}</span>
                  </p>
                  <button
                    onClick={async () => {
                      await onStart(regiment.regiment_id, day.workout_id);
                      navigate(`/start-workout/${regiment.regiment_id}/${day.workout_id}`);
                    }}
                    className="bg-[#4B9CD3] text-white px-3 py-1 rounded hover:bg-blue-500"
                  >
                    Start
                  </button>
                </div>

                {expandedWorkoutId === day.workout_id &&
                  workoutDetails[day.workout_id]?.structure && (
                    <div className="ml-6 mt-2 space-y-2 text-sm text-gray-700">
                      {workoutDetails[day.workout_id].structure.map((ex, idx) => (
                        <div key={idx} className="border p-2 rounded bg-gray-50">
                          <div className="font-semibold">Exercise Name: {ex.exercise_id}</div>
                          <div className="ml-4">
                            {Object.entries(ex.sets).map(([setKey, set]) => {
                              const parts = [];
                              if (set.reps != null) parts.push(`${set.reps} reps`);
                              if (set.weight != null) parts.push(`${set.weight} ${ex.weight_unit || "kg"}`);
                              if (set.time != null) parts.push(`${set.time} ${ex.time_unit || "sec"}`);
                              if (set.laps != null) parts.push(`${set.laps} laps`);
                              return (
                                <div key={setKey}>
                                  <strong>{setKey}:</strong> {parts.join(", ") || "No data"}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}


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

      {undoData && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-500 text-yellow-800 px-4 py-3 rounded shadow">
          Regiment deleted.
          <button
            onClick={handleUndoDelete}
            className="ml-4 underline font-semibold text-yellow-900 hover:text-yellow-700"
          >
            Undo
          </button>
        </div>
      )}

      {currentRegiments.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-2 text-red-600">Current Regiment In Progress</h2>
          {currentRegiments.map((regiment) => renderRegimentCard(regiment, false))}
        </>
      )}


      <h2 className="text-2xl font-bold mb-2 text-purple-600">System Regiments</h2>
      {systemRegiments
        .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => (logCounts[b.regiment_id] || 0) - (logCounts[a.regiment_id] || 0))
        .map((regiment) => renderRegimentCard(regiment, true))}

      <h2 className="text-2xl font-bold mb-2 text-green-600">Your Regiments</h2>
      {userRegiments
        .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((regiment) => renderRegimentCard(regiment, false))}
    </div>
  );
};

export default Workout_Management;
