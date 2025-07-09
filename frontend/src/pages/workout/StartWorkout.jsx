

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../AuthProvider";
import { Check, Play, Pause, X, ArrowLeft, Timer, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const StartWorkout = () => {
  const { regimenId, workoutId } = useParams();
  const { uid } = useAuth();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [regiments, setRegiments] = useState([]);
  const [error, setError] = useState("");
  const [checkedSets, setCheckedSets] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [addedSets, setAddedSets] = useState({}); // { [exerciseIndex]: [setNumbers] }
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = React.useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current); // Clean up on unmountf
  }, []);


  const [logData, setLogData] = useState({
    user_id: uid,
    regiment_id: regimenId ? Number(regimenId) : null,
    actual_workout: [],
  });

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [workoutRes, regimentsRes] = await Promise.all([
          axios.get(`${API_URL}/workouts/${workoutId}`),
          axios.get(`${API_URL}/workouts/regiments`),
        ]);

        const workoutData = workoutRes.data.item;
        setWorkout(workoutData);
        setRegiments(regimentsRes.data.items || []);

        const initChecked = {};
        const initActualWorkout = [];

        workoutData.structure.forEach((exercise, eIdx) => {
          initChecked[eIdx] = {};

          const actualExercise = {
            exercise_id: exercise.exercise_id,
            sets: {},
          };

          Object.entries(exercise.sets).forEach(([setKey, setVal]) => {
            initChecked[eIdx][setKey] = false;

            const actualSet = {};
            if (setVal.reps !== undefined) actualSet.reps = setVal.reps;
            if (setVal.weight !== undefined) actualSet.weight = setVal.weight;
            if (setVal.time !== undefined) actualSet.time = setVal.time;
            if (setVal.laps !== undefined) actualSet.laps = setVal.laps;

            actualExercise.sets[setKey] = actualSet;
          });

          initActualWorkout.push(actualExercise);
        });

        setCheckedSets(initChecked);
        setLogData((prev) => ({
          ...prev,
          actual_workout: initActualWorkout,
        }));
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load workout data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workoutId, uid]);

  const [timer, setTimer] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isRunning: false,
    intervalId: null,
  });

  const [selectedTimer, setSelectedTimer] = useState(null);

  const handleSetCheck = (eIdx, setNumber) => {
    setCheckedSets((prev) => ({
      ...prev,
      [eIdx]: {
        ...prev[eIdx],
        [setNumber]: !prev[eIdx][setNumber],
      },
    }));
  };

  const allExercisesComplete = () => {
    return workout?.structure.every((exercise, eIdx) =>
      Object.keys(exercise.sets).every((setKey) => checkedSets?.[eIdx]?.[setKey])
    );
  };

  const startTimer = () => {
    if (timer.isRunning) return;

    const intervalId = setInterval(() => {
      setTimer(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          clearInterval(intervalId);

          if (selectedTimer) {
            const { eIdx, setNumber } = selectedTimer;
            setCheckedSets(prevChecked => ({
              ...prevChecked,
              [eIdx]: {
                ...prevChecked[eIdx],
                [setNumber]: true,
              },
            }));

            setLogData(prev => {
              const updated = [...prev.actual_workout];
              const exercise = workout.structure[eIdx];
              const setTime = exercise.sets[setNumber].time;
              updated[eIdx].sets[setNumber].time = setTime;
              return { ...prev, actual_workout: updated };
            });
          }

          return { ...prev, isRunning: false };
        }

        return { hours, minutes, seconds, isRunning: true, intervalId };
      });
    }, 1000);

    setTimer(prev => ({ ...prev, isRunning: true, intervalId }));
  };

  const stopTimer = () => {
    if (!timer.isRunning) return;
    clearInterval(timer.intervalId);
    setTimer(prev => ({ ...prev, isRunning: false, intervalId: null }));
  };

  const resetTimer = (timeInSeconds) => {
    if (timer.intervalId) clearInterval(timer.intervalId);

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;

    setTimer({
      hours: 0,
      minutes,
      seconds,
      isRunning: false,
      intervalId: null
    });
  };

  const handleSelectTimer = (eIdx, setNumber) => {
    const exercise = workout.structure[eIdx];
    const set = exercise.sets[setNumber];

    if (set.time) {
      const timeInSeconds = set.time_unit?.toLowerCase().includes("min")
        ? set.time * 60
        : set.time;

      resetTimer(timeInSeconds);
      setSelectedTimer({ eIdx, setNumber });
    }
  };

  const handleActualSetChange = (exerciseIdx, setKey, field, value) => {
    const updated = [...logData.actual_workout];
    updated[exerciseIdx].sets[setKey][field] = value;
    setLogData((prev) => ({ ...prev, actual_workout: updated }));
  };

  const buildActualWorkoutWithUnits = () => {
    return workout.structure.map((exercise, eIdx) => {
      const exerciseLog = {
        exercise_id: exercise.exercise_id,
        sets: {},
      };

      Object.entries(exercise.sets).forEach(([setKey, plannedSet]) => {
        const actualSet = logData.actual_workout[eIdx]?.sets[setKey] || {};

        exerciseLog.sets[setKey] = {
          reps: actualSet.reps ?? plannedSet.reps,
          weight: actualSet.weight ?? plannedSet.weight,
          time: actualSet.time ?? plannedSet.time,
          laps: actualSet.laps ?? plannedSet.laps,
          weight_unit: exercise.weight_unit || "kg",
          time_unit: plannedSet.time_unit || "seconds",
        };

        Object.keys(exerciseLog.sets[setKey]).forEach((key) => {
          if (exerciseLog.sets[setKey][key] === undefined) {
            delete exerciseLog.sets[setKey][key];
          }
        });
      });

      return exerciseLog;
    });
  };

  const handleAddSet = (exerciseIndex) => {
    const currentSets = workout.structure[exerciseIndex].sets;
    const newSetNumber = (Math.max(...Object.keys(currentSets).map(Number)) + 1).toString();

    const { weight_unit = "kg", laps_unit = "", time_unit = "seconds" } = workout.structure[exerciseIndex];

    // Update workout
    setWorkout((prevWorkout) => {
      const newWorkout = { ...prevWorkout };
      const sets = newWorkout.structure[exerciseIndex].sets;

      sets[newSetNumber] = {
        reps: "",
        weight: "",
        time: "",
        laps: "",
        weight_unit,
        time_unit,
        laps_unit,
      };

      return newWorkout;
    });

    // Update logData
    setLogData((prevLogData) => {
      const updated = [...prevLogData.actual_workout];
      updated[exerciseIndex].sets[newSetNumber] = {
        reps: "",
        weight: "",
        time: "",
        laps: "",
      };
      return { ...prevLogData, actual_workout: updated };
    });

    // Update checkedSets
    setCheckedSets((prevChecked) => {
      const updated = { ...prevChecked };
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        [newSetNumber]: false,
      };
      return updated;
    });

    // Track added sets (optional if you use remove functionality)
    setAddedSets((prev) => {
      const current = prev[exerciseIndex] || [];
      return {
        ...prev,
        [exerciseIndex]: [...current, newSetNumber],
      };
    });
  };

  const handleRemoveSet = (exerciseIndex, setNumber) => {
    setWorkout((prevWorkout) => {
      const updatedWorkout = { ...prevWorkout };
      delete updatedWorkout.structure[exerciseIndex].sets[setNumber];
      return updatedWorkout;
    });

    setLogData((prev) => {
      const updated = [...prev.actual_workout];
      delete updated[exerciseIndex].sets[setNumber];
      return { ...prev, actual_workout: updated };
    });

    setCheckedSets((prev) => {
      const updated = { ...prev };
      delete updated[exerciseIndex][setNumber];
      return updated;
    });

    setAddedSets((prev) => {
      const updatedList = (prev[exerciseIndex] || []).filter((num) => num !== setNumber);
      return {
        ...prev,
        [exerciseIndex]: updatedList,
      };
    });
  };

  const handleFinish = async () => {
    if (!uid) {
      alert("User not authenticated. Please log in.");
      return;
    }

    try {
      await axios.put(`${API_URL}/workouts/${workoutId}`, {
        current_user_id: uid,
      });

      const actualWorkoutWithUnits = buildActualWorkoutWithUnits();

      const payload = {
        user_id: Number(uid),
        regiment_id: logData.regiment_id ? Number(logData.regiment_id) : null,
        planned_workout_id: Number(workoutId),
        actual_workout: actualWorkoutWithUnits,
        timee: elapsedSeconds
      };
      console.log("elapsedSeconds:", elapsedSeconds);
      console.log("Payload:", payload);

      await axios.post(`${API_URL}/workouts/logs`, payload);

      if (regimenId) {
        const regimentRes = await axios.get(`${API_URL}/workouts/regiments/${regimenId}`);
        const regiment = regimentRes.data.item;

        const cleanedStructure = regiment.workout_structure.map((day) => ({
          name: day.name,
          workout_id: day.workout_id,
        }));

        await axios.put(`${API_URL}/workouts/regiments/${regimenId}`, {
          workout_structure: cleanedStructure,
        });
      }
      clearInterval(timerRef.current);
      // setShowSuccessMessage(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
      navigate("/Workout_Management");
    } catch (err) {
      console.error("Error finishing workout:", err);
      let errorMessage = err.response?.data?.error?.message || err.message;
      alert(`Error completing workout: ${errorMessage}`);
    }
  };

  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!workout) return <div className="p-4">Loading workout...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white min-h-screen">
      <button
        onClick={() => navigate('/Workout_Management')}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition mb-6 font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Workouts
      </button>

      <div className="sticky top-0 z-40 bg-white flex justify-between items-center mb-8 px-4 py-4 shadow-sm border-b border-gray-200">
        <h1 className="text-3xl font-bold text-[#4B9CD3] tracking-tight">
          {workout.name || "Workout"}
        </h1>
        <div className="text-right text-sm text-gray-500 mb-2">
          Time spent on this page: <span className="font-semibold">{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</span>
        </div>
        <button
          onClick={handleFinish}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${allExercisesComplete()
            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            } text-white font-medium`}
        >
          <Check className="h-5 w-5" /> Finish & Log Workout
        </button>
      </div>

      <div className="space-y-6">
        {workout.structure.map((exercise, eIdx) => (
          <div
            key={eIdx}
            className="bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#4B9CD3] mb-4">
                {exercise.exercise_details?.name || `Exercise ${exercise.exercise_id}`}
              </h2>
              <div className="overflow-x-auto">
                <div className="flex gap-4 px-1 w-max">

                  {Object.entries(exercise.sets).map(([setNumber, set]) => {

                    const isTime = !!set.time;
                    const isChecked = checkedSets?.[eIdx]?.[setNumber];
                    const actualSet = logData.actual_workout[eIdx]?.sets[setNumber] || {};
                    const weightUnit = exercise.weight_unit || "kg";
                    const timeUnit = set.time_unit || "seconds";
                    const lapUnit = exercise.laps_unit || "no units";

                    return (
                      <div
                        key={setNumber}
                        className={`rounded-xl p-4 shadow-sm border transition-all duration-200 
                        ${isChecked ? "bg-green-50 border-green-300" : "bg-white border-gray-300"} 
                        w-full sm:w-[48%] lg:w-[33.5%]`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-[#4B9CD3]">Set {setNumber}</p>
                            <p className="text-sm text-gray-600">
                              Planned: {isTime ? `${set.time} ${timeUnit}` : `${set.reps} Reps`}
                              {set.weight ? ` / ${set.weight} ${weightUnit}` : ""}
                              {set.laps ? ` / ${set.laps} Laps (${lapUnit})` : ""}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            {isTime && (
                              <button
                                onClick={() => handleSelectTimer(eIdx, setNumber)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                              >
                                <Timer className="h-4 w-4" /> Timer
                              </button>
                            )}
                            <button
                              onClick={() => handleSetCheck(eIdx, setNumber)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${isChecked
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                            >
                              {isChecked && <Check className="h-4 w-4" />} Done
                            </button>
                            {addedSets[eIdx]?.includes(setNumber) && (
                              <button
                                onClick={() => handleRemoveSet(eIdx, setNumber)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium ml-2"
                              >
                                <X />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Actual Performance:</p>
                          <div className="flex flex-col gap-4">
                            {"reps" in actualSet && (
                              <div className="group">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm text-gray-700 whitespace-nowrap">
                                    <div>Planned Reps: </div>
                                    <div className="flex items-center gap-1">
                                      {/* <ArrowRight className="w-4 h-4 text-gray-500" /> */}
                                      <span className="font-medium">{set.reps}</span>
                                    </div>
                                    {/* <div className="text-xs text-gray-500">{exercise.weight_unit}</div> */}
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <label className="text-xs text-gray-500 mb-1">Actual Input:</label>
                                    <input
                                      type="number"
                                      value={actualSet.reps}
                                      onChange={(e) => handleActualSetChange(eIdx, setNumber, "reps", e.target.value)}
                                      className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            {"weight" in actualSet && (
                              <div className="group border-t pt-3 mt-3">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm text-gray-700 whitespace-nowrap">
                                    <div>Planned Weight: </div>
                                    <div className="text-xs text-gray-500"> <span className="font-medium  text-gray-700 text-sm whitespace-nowrap">{set.weight || 0}</span> {weightUnit}</div>
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <label className="text-xs text-gray-500 mb-1">Actual Input:</label>
                                    <input
                                      type="number"
                                      value={actualSet.weight}
                                      onChange={(e) => handleActualSetChange(eIdx, setNumber, "weight", e.target.value)}
                                      className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                      min="0"
                                      step="0.1"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* {"weight" in actualSet && (
                              <div className="flex-1 min-w-[70px] space-y-1">
                                <label className="block text-xs text-gray-500 font-medium">Weight Unit</label>
                                <select
                                  value={actualSet.weight_unit || "kg"} // <-- use from actualSet
                                  onChange={(e) => handleActualSetChange(eIdx, setNumber, "weight_unit", e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                >
                                  <option value="kg">kg</option>
                                  <option value="lbs">lbs</option>
                                </select>
                              </div>
                            )} */}
                            {"time" in actualSet && (
                              <div className="group border-t pt-3 mt-3">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm text-gray-700 whitespace-nowrap">
                                    <div>Planned Time:</div>
                                    <div> <span className="font-medium">{set.time || 0}</span> {timeUnit}</div>
                                    {/* <div className="text-xs text-gray-500"></div> */}
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <label className="text-xs text-gray-500 mb-1">Actual Input:</label>
                                    <input
                                      type="number"
                                      value={actualSet.time}
                                      onChange={(e) => handleActualSetChange(eIdx, setNumber, "time", e.target.value)}
                                      className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* {"time" in actualSet && (
                              <div className="flex-1 min-w-[70px] space-y-1">
                                <label className="block text-xs text-gray-500 font-medium">Time Unit</label>
                                <select
                                  value={timeUnit}
                                  onChange={(e) => handleActualSetChange(eIdx, setNumber, "time_unit", e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                >
                                  <option value="seconds">seconds</option>
                                  <option value="minutes">minutes</option>
                                </select>
                              </div>
                            )} */}
                            {"laps" in actualSet && (
                              <div className="group border-t pt-3 mt-3">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm text-gray-700 whitespace-nowrap">
                                    <div>Planned Laps:</div>
                                    <div> <span className="font-medium">{set.laps || 0}</span> {lapUnit}</div>
                                    {/* <div className="text-xs text-gray-500"></div> */}
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <label className="text-xs text-gray-500 mb-1">Actual Input:</label>
                                    <input
                                      type="number"
                                      value={actualSet.laps}
                                      onChange={(e) => handleActualSetChange(eIdx, setNumber, "laps", e.target.value)}
                                      className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4">
                    <button
                      onClick={() => handleAddSet(eIdx)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline transition"
                    >
                      + Add Set
                    </button>
                  </div>
                  {selectedTimer && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white p-6 rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeInUp">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Timer</h3>
                        <button
                          onClick={() => {
                            stopTimer();
                            setSelectedTimer(null);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex justify-between mb-6">
                        <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
                          <p className="text-2xl font-bold">
                            {String(timer.hours).padStart(2, '0')}
                          </p>
                          <p className="text-xs text-gray-500">Hours</p>
                        </div>
                        <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
                          <p className="text-2xl font-bold">
                            {String(timer.minutes).padStart(2, '0')}
                          </p>
                          <p className="text-xs text-gray-500">Minutes</p>
                        </div>
                        <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
                          <p className="text-2xl font-bold">
                            {String(timer.seconds).padStart(2, '0')}
                          </p>
                          <p className="text-xs text-gray-500">Seconds</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={startTimer}
                          disabled={timer.isRunning}
                          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${timer.isRunning
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600 transition"
                            }`}
                        >
                          <Play /> Start
                        </button>
                        <button
                          onClick={stopTimer}
                          disabled={!timer.isRunning}
                          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${!timer.isRunning
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600 transition"
                            }`}
                        >
                          <Pause />Stop
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allExercisesComplete() && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-md hover:shadow-xl transition-all animate-bounce"
          >
            <Check className="h-5 w-5" /> Finish & Log Workout
          </button>
        </div>
      )}
    </div>
  );

};

export default StartWorkout;
