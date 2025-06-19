import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";

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
  const navigate = useNavigate();
  const { uid } = useAuth();
  const userId = Number(uid);  // cast to number to avoid string vs number issues

  useEffect(() => {
    axios.get("http://localhost:3000/api/workouts/regiments")
      .then(async (res) => {
        const regimentsData = res.data.items || [];
        setRegiments(regimentsData);

        const workoutIds = new Set();
        regimentsData.forEach(reg => {
          reg.workout_structure.forEach(day => {
            if (day.workout_id) workoutIds.add(day.workout_id);
          });
        });

        const nameMap = {};
        await Promise.all([...workoutIds].map(async (id) => {
          const res = await axios.get(`http://localhost:3000/api/workouts/${id}`);
          nameMap[id] = res.data?.item?.name || `Workout ${id}`;
        }));
        setWorkoutNames(nameMap);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load regiments.");
      });

    axios.get(`http://localhost:3000/api/workouts/logs/user/${userId}`)
      .then(res => {
        const logs = res.data.items || [];
        setWorkoutLogs(logs);
        const counts = {};
        logs.forEach(log => {
          counts[log.regiment_id] = (counts[log.regiment_id] || 0) + 1;
        });
        setLogCounts(counts);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load workout logs.");
      });

  }, []);

  const toggleRegiment = (id) => {
    setExpandedRegimentId(prev => (prev === id ? null : id));
    setExpandedWorkoutId(null);
  };

  const toggleWorkout = useCallback(async (id) => {
    if (expandedWorkoutId === id) {
      setExpandedWorkoutId(null);
      return;
    }
    if (!workoutDetails[id]) {
      try {
        const res = await axios.get(`http://localhost:3000/api/workouts/${id}`);
        setWorkoutDetails(prev => ({ ...prev, [id]: res.data.item }));
      } catch (err) {
        console.error(err);
        setError("Failed to load workout details.");
      }
    }
    setExpandedWorkoutId(id);
  }, [expandedWorkoutId, workoutDetails]);

  const systemRegiments = regiments.filter(r => Number(r.created_by) !== userId);
  const userRegiments = regiments.filter(r => Number(r.created_by) === userId);

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
      {expandedRegimentId === regiment.regiment_id && (
        <div className="mt-3 space-y-2 ml-4">
          {regiment.workout_structure.map(day => (
            <div key={day.workout_id} className="flex items-center justify-between pr-4">
              <p
                className="text-[#4B9CD3] cursor-pointer hover:text-blue-500 underline"
                onClick={() => toggleWorkout(day.workout_id)}
              >
                {day.name} - {workoutNames[day.workout_id] || "Loading..."}
              </p>
              <button
                onClick={() => navigate(`/start-workout/${regiment.regiment_id}/${day.workout_id}`)}
                className="bg-[#4B9CD3] text-white px-3 py-1 rounded hover:bg-blue-500"
              >
                Start
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLogCard = (regiment, logs) => (
    <div key={regiment.regiment_id} className="bg-white shadow rounded-lg mb-4 p-4 border">
      <h2
        className="text-xl font-semibold cursor-pointer text-[#4B9CD3] hover:text-blue-500"
        onClick={() => toggleRegiment(regiment.regiment_id)}
      >
        {regiment.name}
        <span className="text-sm text-gray-500 ml-2">({logs.length} logs)</span>
      </h2>
      {expandedRegimentId === regiment.regiment_id && (
        <div className="mt-3 space-y-4 ml-4">
          {logs
            .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
            .map(log => (
              <div key={log.workout_log_id} className="p-3 border rounded-md bg-gray-50">
                <p><strong>Date:</strong> {log.log_date}</p>
                <p><strong>Workout:</strong> {log.planned_workout_name}</p>
                <p><strong>Score:</strong> {log.score}</p>

                {log.actual_workout?.length > 0 ? (
                  <div className="mt-2">
                    <h4 className="font-semibold text-gray-700 mb-1">Exercises:</h4>
                    {log.actual_workout.map((exercise, index) => (
                      <div key={index} className="mb-2 ml-2">
                        <p className="font-semibold text-[#4B9CD3]">Exercise ID: {exercise.exercise_id}</p>
                        <div className="ml-4">
                          {Object.entries(exercise.sets).map(([setName, setData]) => (
                            <div key={setName} className="text-sm text-gray-700">
                              <strong>{setName}:</strong>
                              {setData.reps !== undefined && ` ${setData.reps} reps`}
                              {setData.weight !== undefined && `, ${setData.weight}${setData.weight_unit || ""}`}
                              {setData.time !== undefined && `, ${setData.time} sec`}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No actual workout data recorded.</p>
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
          onClick={() => setShowLogs(prev => !prev)}
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
          <h2 className="text-2xl font-bold mb-2 text-purple-600">System Regiments</h2>
          {systemRegiments
            .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => (logCounts[b.regiment_id] || 0) - (logCounts[a.regiment_id] || 0))
            .map(regiment => renderRegimentCard(regiment, true))}

          <h2 className="text-2xl font-bold mb-2 text-green-600">Your Regiments</h2>
          {userRegiments
            .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(regiment => renderRegimentCard(regiment, false))}
        </>
      )}

      {showLogs && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-purple-600">Workout Logs</h2>
          {[...systemRegiments, ...userRegiments]
            .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(regiment => {
              const logs = workoutLogs.filter(log => log.regiment_id === regiment.regiment_id);
              if (logs.length === 0) return null;
              return renderLogCard(regiment, logs);
            })}
        </>
      )}
    </div>
  );
};

export default Workout_Management;
