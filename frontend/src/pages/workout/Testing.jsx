
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../AuthProvider";
import { Check, Play, Pause, X, ArrowLeft, Timer } from "lucide-react";

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

  const [logData, setLogData] = useState({
    user_id: uid,
    regiment_id: regimenId ? Number(regimenId) : null,
    actual_workout: [],
  });

  const [timer, setTimer] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isRunning: false,
    intervalId: null,
  });

  const [selectedTimer, setSelectedTimer] = useState(null);

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
      };

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

      alert("Workout completed and logged successfully!");
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
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Workouts
      </button>

      <div className="sticky top-0 z-40 bg-white flex justify-between items-center mb-8 px-4 py-4 shadow-sm border-b border-gray-200">
        <h1 className="text-3xl font-bold text-[#4B9CD3] tracking-tight">
          {workout.name || "Workout"}
        </h1>
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
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#4B9CD3] mb-4">
                {exercise.exercise_details?.name || `Exercise ${exercise.exercise_id}`}
              </h2>

              <div className="flex flex-wrap gap-4">
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
                      className={`border rounded-lg p-4 transition-all duration-200 ${isChecked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-[#4B9CD3]">Set {setNumber}</p>
                          {/* <p className="text-sm text-gray-600">
                            Planned: {isTime ? `${set.time} ${timeUnit}` : `${set.reps} Reps`}
                            {set.weight ? ` / ${set.weight} ${weightUnit}` : ""}
                            {set.laps ? ` / ${set.laps} Laps (${lapUnit})` : ""}
                          </p> */}
                        </div>

                        <div className="flex gap-2 items-center">
                          {isTime && (
                            <button
                              onClick={() => handleSelectTimer(eIdx, setNumber)}
                              className="flex items-center gap-1 px-3 py-1 bg-[#4B9CD3] text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              <Timer className="h-4 w-4" /> Timer
                            </button>
                          )}
                          <button
                            onClick={() => handleSetCheck(eIdx, setNumber)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${isChecked
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              }`}
                          >
                            {isChecked && <Check className="h-4 w-4" />} Done
                          </button>
                        </div>
                      </div>

                      <div className="border-t pt-3 mt-3">
                        <div className="flex flex-col gap-4">

                          {/* Reps */}
                          {"reps" in actualSet && (
                            <div className="group">
                              <div className="flex items-center justify-between gap-4">
                                <div className="text-sm text-gray-700 whitespace-nowrap">
                                  <div>Planned Reps: <span className="font-medium">{set.reps}</span></div>
                                  <div className="text-xs text-gray-500">{exercise.weight_unit}</div>
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

                          {/* Weight */}
                          {"weight" in actualSet && (
                            <div className="group border-t pt-3 mt-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="text-sm text-gray-700 whitespace-nowrap">
                                  <div>Planned Weight: <span className="font-medium">{set.weight || 0}</span></div>
                                  <div className="text-xs text-gray-500">{weightUnit}</div>
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

                          {/* Time */}
                          {"time" in actualSet && (
                            <div className="group border-t pt-3 mt-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="text-sm text-gray-700 whitespace-nowrap">
                                  <div>Planned Time: <span className="font-medium">{set.time || 0}</span></div>
                                  <div className="text-xs text-gray-500">{timeUnit}</div>
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

                          {/* Laps */}
                          {"laps" in actualSet && (
                            <div className="group border-t pt-3 mt-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="text-sm text-gray-700 whitespace-nowrap">
                                  <div>Planned Laps: <span className="font-medium">{set.laps || 0}</span></div>
                                  <div className="text-xs text-gray-500">{lapUnit}</div>
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
              </div>
            </div>
          </div>
        ))}
      </div>
      {allExercisesComplete() && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center">
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium animate-bounce"
          >
            <Check className="h-5 w-5" /> Finish & Log Workout
          </button>
        </div>
      )}
      
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
              <X className="h-6 w-6" />
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
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
                }`}
            >
              <Play className="h-5 w-5" /> Start
            </button>
            <button
              onClick={stopTimer}
              disabled={!timer.isRunning}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${!timer.isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 transition-colors'
                }`}
            >
              <Pause className="h-5 w-5" /> Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartWorkout;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../../AuthProvider";
// import { Check, Play, Pause, X, ArrowLeft, Timer } from "lucide-react";

// const API_URL = import.meta.env.VITE_BACKEND_URL;

// const StartWorkout = () => {
//   const { regimenId, workoutId } = useParams();
//   const { uid } = useAuth();
//   const navigate = useNavigate();

//   const [workout, setWorkout] = useState(null);
//   const [regiments, setRegiments] = useState([]);
//   const [error, setError] = useState("");
//   const [checkedSets, setCheckedSets] = useState({});
//   const [isLoading, setIsLoading] = useState(true);

//   const [logData, setLogData] = useState({
//     user_id: uid,
//     regiment_id: regimenId ? Number(regimenId) : null,
//     actual_workout: [],
//   });

//   const [timer, setTimer] = useState({
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//     isRunning: false,
//     intervalId: null,
//   });

//   const [selectedTimer, setSelectedTimer] = useState(null);

//   useEffect(() => {
//     if (!uid) return;

//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const [workoutRes, regimentsRes] = await Promise.all([
//           axios.get(`${API_URL}/workouts/${workoutId}`),
//           axios.get(`${API_URL}/workouts/regiments`),
//         ]);

//         const workoutData = workoutRes.data.item;
//         setWorkout(workoutData);
//         setRegiments(regimentsRes.data.items || []);

//         const initChecked = {};
//         const initActualWorkout = [];

//         workoutData.structure.forEach((exercise, eIdx) => {
//           initChecked[eIdx] = {};

//           const actualExercise = {
//             exercise_id: exercise.exercise_id,
//             sets: {},
//           };

//           Object.entries(exercise.sets).forEach(([setKey, setVal]) => {
//             initChecked[eIdx][setKey] = false;

//             const actualSet = {};
//             if (setVal.reps !== undefined) actualSet.reps = setVal.reps;
//             if (setVal.weight !== undefined) actualSet.weight = setVal.weight;
//             if (setVal.time !== undefined) actualSet.time = setVal.time;
//             if (setVal.laps !== undefined) actualSet.laps = setVal.laps;

//             actualExercise.sets[setKey] = actualSet;
//           });

//           initActualWorkout.push(actualExercise);
//         });

//         setCheckedSets(initChecked);
//         setLogData((prev) => ({
//           ...prev,
//           actual_workout: initActualWorkout,
//         }));
//       } catch (err) {
//         console.error("Error loading data:", err);
//         setError("Failed to load workout data.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [workoutId, uid]);

//   const handleSetCheck = (eIdx, setNumber) => {
//     setCheckedSets((prev) => ({
//       ...prev,
//       [eIdx]: {
//         ...prev[eIdx],
//         [setNumber]: !prev[eIdx][setNumber],
//       },
//     }));
//   };

//   const allExercisesComplete = () => {
//     return workout?.structure.every((exercise, eIdx) =>
//       Object.keys(exercise.sets).every((setKey) => checkedSets?.[eIdx]?.[setKey])
//     );
//   };

//   const startTimer = () => {
//     if (timer.isRunning) return;

//     const intervalId = setInterval(() => {
//       setTimer(prev => {
//         let { hours, minutes, seconds } = prev;

//         if (seconds > 0) {
//           seconds--;
//         } else if (minutes > 0) {
//           minutes--;
//           seconds = 59;
//         } else if (hours > 0) {
//           hours--;
//           minutes = 59;
//           seconds = 59;
//         } else {
//           clearInterval(intervalId);

//           if (selectedTimer) {
//             const { eIdx, setNumber } = selectedTimer;
//             setCheckedSets(prevChecked => ({
//               ...prevChecked,
//               [eIdx]: {
//                 ...prevChecked[eIdx],
//                 [setNumber]: true,
//               },
//             }));

//             setLogData(prev => {
//               const updated = [...prev.actual_workout];
//               const exercise = workout.structure[eIdx];
//               const setTime = exercise.sets[setNumber].time;
//               updated[eIdx].sets[setNumber].time = setTime;
//               return { ...prev, actual_workout: updated };
//             });
//           }

//           return { ...prev, isRunning: false };
//         }

//         return { hours, minutes, seconds, isRunning: true, intervalId };
//       });
//     }, 1000);

//     setTimer(prev => ({ ...prev, isRunning: true, intervalId }));
//   };

//   const stopTimer = () => {
//     if (!timer.isRunning) return;
//     clearInterval(timer.intervalId);
//     setTimer(prev => ({ ...prev, isRunning: false, intervalId: null }));
//   };

//   const resetTimer = (timeInSeconds) => {
//     if (timer.intervalId) clearInterval(timer.intervalId);

//     const minutes = Math.floor(timeInSeconds / 60);
//     const seconds = timeInSeconds % 60;

//     setTimer({
//       hours: 0,
//       minutes,
//       seconds,
//       isRunning: false,
//       intervalId: null
//     });
//   };

//   const handleSelectTimer = (eIdx, setNumber) => {
//     const exercise = workout.structure[eIdx];
//     const set = exercise.sets[setNumber];

//     if (set.time) {
//       const timeInSeconds = set.time_unit?.toLowerCase().includes("min")
//         ? set.time * 60
//         : set.time;

//       resetTimer(timeInSeconds);
//       setSelectedTimer({ eIdx, setNumber });
//     }
//   };

//   const handleActualSetChange = (exerciseIdx, setKey, field, value) => {
//     const updated = [...logData.actual_workout];
//     updated[exerciseIdx].sets[setKey][field] = value;
//     setLogData((prev) => ({ ...prev, actual_workout: updated }));
//   };

//   const buildActualWorkoutWithUnits = () => {
//     return workout.structure.map((exercise, eIdx) => {
//       const exerciseLog = {
//         exercise_id: exercise.exercise_id,
//         sets: {},
//       };

//       Object.entries(exercise.sets).forEach(([setKey, plannedSet]) => {
//         const actualSet = logData.actual_workout[eIdx]?.sets[setKey] || {};

//         exerciseLog.sets[setKey] = {
//           reps: actualSet.reps ?? plannedSet.reps,
//           weight: actualSet.weight ?? plannedSet.weight,
//           time: actualSet.time ?? plannedSet.time,
//           laps: actualSet.laps ?? plannedSet.laps,
//           weight_unit: exercise.weight_unit || "kg",
//           time_unit: plannedSet.time_unit || "seconds",
//         };

//         Object.keys(exerciseLog.sets[setKey]).forEach((key) => {
//           if (exerciseLog.sets[setKey][key] === undefined) {
//             delete exerciseLog.sets[setKey][key];
//           }
//         });
//       });

//       return exerciseLog;
//     });
//   };

//   const handleFinish = async () => {
//     if (!uid) {
//       alert("User not authenticated. Please log in.");
//       return;
//     }

//     try {
//       await axios.put(`${API_URL}/workouts/${workoutId}`, {
//         current_user_id: uid,
//       });

//       const actualWorkoutWithUnits = buildActualWorkoutWithUnits();

//       const payload = {
//         user_id: Number(uid),
//         regiment_id: logData.regiment_id ? Number(logData.regiment_id) : null,
//         planned_workout_id: Number(workoutId),
//         actual_workout: actualWorkoutWithUnits,
//       };

//       await axios.post(`${API_URL}/workouts/logs`, payload);

//       if (regimenId) {
//         const regimentRes = await axios.get(`${API_URL}/workouts/regiments/${regimenId}`);
//         const regiment = regimentRes.data.item;

//         const cleanedStructure = regiment.workout_structure.map((day) => ({
//           name: day.name,
//           workout_id: day.workout_id,
//         }));

//         await axios.put(`${API_URL}/workouts/regiments/${regimenId}`, {
//           workout_structure: cleanedStructure,
//         });
//       }

//       alert("Workout completed and logged successfully!");
//       navigate("/Workout_Management");
//     } catch (err) {
//       console.error("Error finishing workout:", err);
//       let errorMessage = err.response?.data?.error?.message || err.message;
//       alert(`Error completing workout: ${errorMessage}`);
//     }
//   };

//   if (error) return <div className="text-red-600 p-4">{error}</div>;
//   if (isLoading) return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//     </div>
//   );
//   if (!workout) return <div className="p-4">Loading workout...</div>;

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-8 bg-white min-h-screen">
//       <button
//         onClick={() => navigate('/Workout_Management')}
//         className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
//       >
//         <ArrowLeft className="h-5 w-5" /> Back to Workouts
//       </button>

//       <div className="sticky top-0 z-40 bg-white flex justify-between items-center mb-8 px-4 py-4 shadow-sm border-b border-gray-200">
//         <h1 className="text-3xl font-bold text-[#4B9CD3] tracking-tight">
//           {workout.name || "Workout"}
//         </h1>
//         <button
//           onClick={handleFinish}
//           className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${allExercisesComplete()
//             ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
//             : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
//             } text-white font-medium`}
//         >
//           <Check className="h-5 w-5" /> Finish & Log Workout
//         </button>
//       </div>

//       <div className="space-y-6">
//         {workout.structure.map((exercise, eIdx) => (
//           <div
//             key={eIdx}
//             className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
//           >
//             <div className="p-6">
//               <h2 className="text-xl font-bold text-[#4B9CD3] mb-4">
//                 {exercise.exercise_details?.name || `Exercise ${exercise.exercise_id}`}
//               </h2>

//               <div className="flex flex-wrap gap-4">
//                 {Object.entries(exercise.sets).map(([setNumber, set]) => {
//                   const isTime = !!set.time;
//                   const isChecked = checkedSets?.[eIdx]?.[setNumber];
//                   const actualSet = logData.actual_workout[eIdx]?.sets[setNumber] || {};
//                   const weightUnit = exercise.weight_unit || "kg";
//                   const timeUnit = set.time_unit || "seconds";
//                   const lapUnit = exercise.laps_unit || "no units";

//                   return (
//                     <div
//                       key={setNumber}
//                       className={`border rounded-lg p-4 transition-all duration-200 ${isChecked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
//                         }`}
//                     >
//                       <div className="flex justify-between items-start mb-3">
//                         <div>
//                           <p className="font-medium text-[#4B9CD3]">Set {setNumber}</p>
//                           {/* <p className="text-sm text-gray-600">
//                             Planned: {isTime ? `${set.time} ${timeUnit}` : `${set.reps} Reps`}
//                             {set.weight ? ` / ${set.weight} ${weightUnit}` : ""}
//                             {set.laps ? ` / ${set.laps} Laps (${lapUnit})` : ""}
//                           </p> */}
//                         </div>

//                         <div className="flex gap-2 items-center">
//                           {isTime && (
//                             <button
//                               onClick={() => handleSelectTimer(eIdx, setNumber)}
//                               className="flex items-center gap-1 px-3 py-1 bg-[#4B9CD3] text-white rounded hover:bg-blue-600 transition-colors"
//                             >
//                               <Timer className="h-4 w-4" /> Timer
//                             </button>
//                           )}
//                           <button
//                             onClick={() => handleSetCheck(eIdx, setNumber)}
//                             className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${isChecked
//                               ? "bg-green-500 text-white hover:bg-green-600"
//                               : "bg-gray-200 text-gray-800 hover:bg-gray-300"
//                               }`}
//                           >
//                             {isChecked && <Check className="h-4 w-4" />} Done
//                           </button>
//                         </div>
//                       </div>

//                       <div className="border-t pt-3 mt-3">
//                         <div className="flex flex-col gap-4">

//                           {/* Reps */}
//                           {"reps" in actualSet && (
//                             <div className="group">
//                               <div className="flex items-center justify-between gap-4">
//                                 <div className="text-sm text-gray-700 whitespace-nowrap">
//                                   <div>Planned Reps: <span className="font-medium">{set.reps}</span></div>
//                                   <div className="text-xs text-gray-500">{exercise.weight_unit}</div>
//                                 </div>
//                                 <div className="flex flex-col items-start">
//                                   <label className="text-xs text-gray-500 mb-1">Actual Input:</label>
//                                   <input
//                                     type="number"
//                                     value={actualSet.reps}
//                                     onChange={(e) => handleActualSetChange(eIdx, setNumber, "reps", e.target.value)}
//                                     className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
//                                     min="0"
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                           )}

//                           {/* Weight */}
//                           {"weight" in actualSet && (
//                             <div className="group border-t pt-3 mt-3">
//                               <div className="flex items-center justify-between gap-4">
//                                 <div className="text-sm text-gray-700 whitespace-nowrap">
//                                   <div>Planned Weight: <span className="font-medium">{set.weight || 0}</span></div>
//                                   <div className="text-xs text-gray-500">{weightUnit}</div>
//                                 </div>
//                                 <div className="flex flex-col items-start">
//                                   <label className="text-xs text-gray-500 mb-1">Actual Input:</label>
//                                   <input
//                                     type="number"
//                                     value={actualSet.weight}
//                                     onChange={(e) => handleActualSetChange(eIdx, setNumber, "weight", e.target.value)}
//                                     className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
//                                     min="0"
//                                     step="0.1"
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                           )}

//                           {/* Time */}
//                           {"time" in actualSet && (
//                             <div className="group border-t pt-3 mt-3">
//                               <div className="flex items-center justify-between gap-4">
//                                 <div className="text-sm text-gray-700 whitespace-nowrap">
//                                   <div>Planned Time: <span className="font-medium">{set.time || 0}</span></div>
//                                   <div className="text-xs text-gray-500">{timeUnit}</div>
//                                 </div>
//                                 <div className="flex flex-col items-start">
//                                   <label className="text-xs text-gray-500 mb-1">Actual Input:</label>
//                                   <input
//                                     type="number"
//                                     value={actualSet.time}
//                                     onChange={(e) => handleActualSetChange(eIdx, setNumber, "time", e.target.value)}
//                                     className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
//                                     min="0"
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                           )}

//                           {/* Laps */}
//                           {"laps" in actualSet && (
//                             <div className="group border-t pt-3 mt-3">
//                               <div className="flex items-center justify-between gap-4">
//                                 <div className="text-sm text-gray-700 whitespace-nowrap">
//                                   <div>Planned Laps: <span className="font-medium">{set.laps || 0}</span></div>
//                                   <div className="text-xs text-gray-500">{lapUnit}</div>
//                                 </div>
//                                 <div className="flex flex-col items-start">
//                                   <label className="text-xs text-gray-500 mb-1">Actual Input:</label>
//                                   <input
//                                     type="number"
//                                     value={actualSet.laps}
//                                     onChange={(e) => handleActualSetChange(eIdx, setNumber, "laps", e.target.value)}
//                                     className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
//                                     min="0"
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                           )}

//                         </div>
//                       </div>

//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       {allExercisesComplete() && (
//         <div className="fixed bottom-6 left-0 right-0 flex justify-center">
//           <button
//             onClick={handleFinish}
//             className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium animate-bounce"
//           >
//             <Check className="h-5 w-5" /> Finish & Log Workout
//           </button>
//         </div>
//       )}
      
//       {selectedTimer && (
//         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white p-6 rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeInUp">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-800">Timer</h3>
//             <button
//               onClick={() => {
//                 stopTimer();
//                 setSelectedTimer(null);
//               }}
//               className="text-red-500 hover:text-red-700 transition-colors"
//             >
//               <X className="h-6 w-6" />
//             </button>
//           </div>

//           <div className="flex justify-between mb-6">
//             <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
//               <p className="text-2xl font-bold">
//                 {String(timer.hours).padStart(2, '0')}
//               </p>
//               <p className="text-xs text-gray-500">Hours</p>
//             </div>
//             <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
//               <p className="text-2xl font-bold">
//                 {String(timer.minutes).padStart(2, '0')}
//               </p>
//               <p className="text-xs text-gray-500">Minutes</p>
//             </div>
//             <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
//               <p className="text-2xl font-bold">
//                 {String(timer.seconds).padStart(2, '0')}
//               </p>
//               <p className="text-xs text-gray-500">Seconds</p>
//             </div>
//           </div>

//           <div className="flex gap-4">
//             <button
//               onClick={startTimer}
//               disabled={timer.isRunning}
//               className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${timer.isRunning
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
//                 }`}
//             >
//               <Play className="h-5 w-5" /> Start
//             </button>
//             <button
//               onClick={stopTimer}
//               disabled={!timer.isRunning}
//               className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${!timer.isRunning
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 : 'bg-red-500 text-white hover:bg-red-600 transition-colors'
//                 }`}
//             >
//               <Pause className="h-5 w-5" /> Stop
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StartWorkout;


// // // import { useCallback, useEffect, useRef, useState } from "react";
// // // // import axios from "axios";
// // // // import { useNavigate } from "react-router-dom";
// // // // import { useAuth } from "../../AuthProvider";
// // // // import { Trash2 } from 'lucide-react';
// // // // import { Pencil } from 'lucide-react';
// // // // import { Play } from 'lucide-react';
// // // // const API_URL = import.meta.env.VITE_BACKEND_URL;

// // // // const Workout_Management = () => {
// // // //   const [regiments, setRegiments] = useState([]);
// // // //   const [workoutLogs, setWorkoutLogs] = useState([]);
// // // //   const [workoutNames, setWorkoutNames] = useState({});
// // // //   const [workoutDetails, setWorkoutDetails] = useState({});
// // // //   const [logCounts, setLogCounts] = useState({});
// // // //   const [expandedRegimentId, setExpandedRegimentId] = useState(null);
// // // //   const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
// // // //   const [searchQuery, setSearchQuery] = useState("");
// // // //   const [showLogs, setShowLogs] = useState(false);
// // // //   const [error, setError] = useState("");  //--
// // // //   const [recentRegiments, setRecentRegiments] = useState([]);
// // // //   // const [exerciseNames, setExerciseNames] = useState({});
// // // //   const [currentPlannedRegiments, setCurrentPlannedRegiments] = useState([]);
// // // //   const [completedRegiments, setCompletedRegiments] = useState([]);
// // // //   const [completedWorkoutIds, setCompletedWorkoutIds] = useState(new Set());

// // // //   const navigate = useNavigate();
// // // //   const { uid } = useAuth();
// // // //   const userId = Number(uid);

// // // //   const getCurrentPlannedRegiments = (regiments, logs) => {
// // // //     const completedMap = {};

// // // //     logs.forEach((log) => {
// // // //       if (!completedMap[log.regiment_id]) {
// // // //         completedMap[log.regiment_id] = new Set();
// // // //       }
// // // //       completedMap[log.regiment_id].add(log.planned_workout_id);
// // // //     });

// // // //     return regiments.filter((reg) => {
// // // //       const completedWorkouts = completedMap[reg.regiment_id];
// // // //       if (!completedWorkouts) return false; // ✅ skip if user has never logged any workout from this regiment

// // // //       const allWorkouts = reg.workout_structure.map((w) => w.workout_id);

// // // //       // ✅ include only if some workouts are *not* completed
// // // //       return allWorkouts.some((id) => !completedWorkouts.has(id));
// // // //     });
// // // //   };

// // // //   const getCompletedRegiments = (regiments, logs) => {
// // // //     const completedMap = {};

// // // //     logs.forEach((log) => {
// // // //       if (!completedMap[log.regiment_id]) {
// // // //         completedMap[log.regiment_id] = new Set();
// // // //       }
// // // //       completedMap[log.regiment_id].add(log.planned_workout_id);
// // // //     });

// // // //     return regiments.filter((reg) => {
// // // //       const completedWorkouts = completedMap[reg.regiment_id] || new Set();
// // // //       const allWorkoutIds = reg.workout_structure.map((w) => w.workout_id);

// // // //       // ✅ Regiment is completed if all its workouts have been logged
// // // //       return allWorkoutIds.every((id) => completedWorkouts.has(id));
// // // //     });
// // // //   };

// // // //   useEffect(() => {
// // // //     const fetchData = async () => {
// // // //       try {
// // // //         const regRes = await axios.get(`${API_URL}/workouts/regiments`);
// // // //         const regimentsData = regRes.data.items || [];
// // // //         setRegiments(regimentsData);

// // // //         const recentSystemRegiments = regimentsData
// // // //           .filter((r) => Number(r.created_by) !== userId)
// // // //           .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
// // // //           .slice(0, 5);
// // // //         setRecentRegiments(recentSystemRegiments);

// // // //         // 🧠 Collect workout IDs
// // // //         const workoutIds = new Set();
// // // //         regimentsData.forEach((reg) => {
// // // //           reg.workout_structure.forEach((day) => {
// // // //             if (day.workout_id) workoutIds.add(day.workout_id);
// // // //           });
// // // //         });

// // // //         // 🔁 Fetch all workouts and their exercise names
// // // //         const workoutDetailsMap = {};
// // // //         await Promise.all(
// // // //           [...workoutIds].map(async (id) => {
// // // //             const res = await axios.get(`${API_URL}/workouts/${id}`);
// // // //             const workout = res.data.item;

// // // //             const detailedExercises = workout.structure.map((ex) => {
// // // //               return {
// // // //                 ...ex,
// // // //                 name: ex.exercise_details?.name || `Exercise ${ex.exercise_id}`,
// // // //                 weight_unit: ex.weight_unit || "",
// // // //                 time_unit: ex.time_unit || "sec",
// // // //                 lap_unit: ex.lap_unit || "",
// // // //               };
// // // //             });
// // // //             workoutDetailsMap[id] = { ...workout, structure: detailedExercises };
// // // //           })
// // // //         );
// // // //         setWorkoutDetails(workoutDetailsMap);

// // // //         // 📝 Workout names for UI
// // // //         const workoutNameMap = {};
// // // //         Object.entries(workoutDetailsMap).forEach(([id, workout]) => {
// // // //           workoutNameMap[id] = workout.name;
// // // //         });
// // // //         setWorkoutNames(workoutNameMap);

// // // //         // 📚 Workout logs
// // // //         const logRes = await axios.get(`${API_URL}/workouts/logs/user/${userId}`);
// // // //         const logs = logRes.data.items || [];
// // // //         setWorkoutLogs(logs);

// // // //         const completedWorkoutIds = new Set(logs.map(log => log.planned_workout_id));

// // // //         // 📊 Log counts
// // // //         const counts = {};
// // // //         logs.forEach((log) => {
// // // //           counts[log.regiment_id] = (counts[log.regiment_id] || 0) + 1;
// // // //         });
// // // //         setLogCounts(counts);

// // // //         const inProgress = getCurrentPlannedRegiments(regimentsData, logs);
// // // //         setCurrentPlannedRegiments(inProgress);

// // // //         const completed = getCompletedRegiments(regimentsData, logs);
// // // //         setCompletedRegiments(completed);
// // // //       } catch (err) {
// // // //         console.error(err);
// // // //         setError("Failed to load data.");
// // // //       }
// // // //     };

// // // //     fetchData();
// // // //   }, [API_URL, userId]);

// // // //   const currentPlannedIds = new Set(currentPlannedRegiments.map(r => r.regiment_id));
// // // //   const completedIds = new Set(completedRegiments.map(r => r.regiment_id));

// // // //   const toggleRegiment = (id) => {
// // // //     setExpandedRegimentId((prev) => (prev === id ? null : id));
// // // //     setExpandedWorkoutId(null);
// // // //   };

// // // //   const toggleWorkout = useCallback(
// // // //     (id) => {
// // // //       if (expandedWorkoutId === id) {
// // // //         setExpandedWorkoutId(null);
// // // //         return;
// // // //       }

// // // //       // Log the workout details before expanding
// // // //       // console.log("Toggling Workout ID:", id);
// // // //       // console.log("WorkoutDetails for this ID:", workoutDetails[id]);

// // // //       if (!workoutDetails[id]) {
// // // //         console.warn(`Workout ID ${id} not found in workoutDetails!`);
// // // //       } else {
// // // //         workoutDetails[id].structure.forEach((exercise, i) => {
// // // //           // console.log(
// // // //           //   `Exercise ${i + 1}:`,
// // // //           //   exercise.name,
// // // //           //   "| weight_unit:",
// // // //           //   exercise.weight_unit,
// // // //           //   "| time_unit:",
// // // //           //   exercise.time_unit,
// // // //           //   "| lap_unit:",
// // // //           //   exercise.lap_unit
// // // //           // );
// // // //         });
// // // //       }

// // // //       setExpandedWorkoutId(id);
// // // //     },
// // // //     [expandedWorkoutId, workoutDetails]
// // // //   );


// // // //   const systemRegiments = regiments.filter((r) => Number(r.created_by) !== userId);
// // // //   const userRegiments = regiments.filter((r) => Number(r.created_by) === userId);


// // // //   const handleDeleteRegiment = async (regimentId, created_by) => {

// // // //     if (!window.confirm("Are you sure you want to delete this regiment?")) return;

// // // //     try {
// // // //       if (created_by === userId) {
// // // //         await axios.delete(`${API_URL}/workouts/regiments/${regimentId}`);
// // // //         alert("Regiment deleted successfully.");
// // // //         window.location.reload();
// // // //       }
// // // //       // ⬇️ Refresh or refetch regiments here
// // // //       // fetchRegiments(); // replace with your actual fetch function
// // // //     } catch (err) {
// // // //       console.error("Failed to delete regiment:", err);
// // // //       alert("Failed to delete regiment. Please try again.");
// // // //     }
// // // //   };


// // // //   const renderRegimentCard = (regiment, includeLogCount = true, workoutDetails) => (
// // // //     <div
// // // //       key={regiment.regiment_id}
// // // //       className="bg-white shadow rounded-lg mb-4 p-1 border"
// // // //     >
// // // //       <h2
// // // //         className="text-xl font-semibold cursor-pointer text-[#4B9CD3] hover:text-blue-500 flex flex-col sm:flex-row sm:items-center sm:justify-between"
// // // //         onClick={() => toggleRegiment(regiment.regiment_id)}
// // // //       >
// // // //         <span>{regiment.name}</span>
// // // //         <div className="text-sm text-gray-500 mt-1 sm:mt-0 sm:ml-4 italic">
// // // //           {Number(regiment.created_by) === userId
// // // //             ? "Created by you"
// // // //             : `Created by ${regiment.created_by_name || "someone"}`}
// // // //           <span className="text-sm font-normal text-gray-600 ml-2">
// // // //             (Intensity: {regiment.intensity || "N/A"})
// // // //           </span>

// // // //           {includeLogCount && (
// // // //             <span className="ml-2 not-italic">(Logged {logCounts[regiment.regiment_id] || 0} times)</span>
// // // //           )}
// // // //         </div>
// // // //       </h2>

// // // //       {/* 💡 Action buttons */}
// // // //       {/* {Number(regiment.created_by) === userId && (
// // // //         <div className="mt-2 flex flex-wrap gap-2 justify-end">
// // // //           <button
// // // //             onClick={() => navigate(`/workouts/regiments/${regiment.regiment_id}`)}
// // // //             className="flex items-center gap-1 text-sm px-4 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all duration-200"
// // // //           >
// // // //             <Pencil className="h-4 w-4" /> Update
// // // //           </button>

// // // //           <button
// // // //             onClick={() => handleDeleteRegiment(regiment.regiment_id, regiment.created_by)}
// // // //             className="flex items-center gap-1 text-sm px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
// // // //           >
// // // //             <Trash2 className="h-4 w-4" /> Delete
// // // //           </button>
// // // //         </div>

// // // //       )} */}
// // // //       {expandedRegimentId === regiment.regiment_id && (
// // // //         <div className="mt-3 space-y-2">
// // // //           {Number(regiment.created_by) === userId && (
// // // //             <div className="mb-2 flex flex-wrap gap-2 justify-end">
// // // //               <button
// // // //                 onClick={() => navigate(`/workouts/regiments/${regiment.regiment_id}`)}
// // // //                 className="flex items-center gap-1 text-sm px-4 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all duration-200"
// // // //               >
// // // //                 <Pencil className="h-4 w-4" /> Update
// // // //               </button>

// // // //               <button
// // // //                 onClick={() => handleDeleteRegiment(regiment.regiment_id, regiment.created_by)}
// // // //                 className="flex items-center gap-1 text-sm px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
// // // //               >
// // // //                 <Trash2 className="h-4 w-4" /> Delete
// // // //               </button>
// // // //             </div>
// // // //           )}
// // // //           {regiment.workout_structure.map((day) => (
// // // //             <div key={day.workout_id} className="space-y-1">
// // // //               <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
// // // //                 <div
// // // //                   className="flex-1 text-[#4B9CD3] cursor-pointer hover:text-blue-500 underline text-sm sm:text-base"
// // // //                   onClick={() => toggleWorkout(day.workout_id)}
// // // //                 >
// // // //                   <p className="font-medium">
// // // //                     {day.name} - {workoutNames[day.workout_id] || "Loading..."}
// // // //                     <span className="ml-2 text-sm text-gray-500 italic">
// // // //                       (Score: {workoutDetails[day.workout_id]?.score || "N/A"})
// // // //                     </span>
// // // //                     {completedWorkoutIds.has(day.workout_id) && (
// // // //                       <span className="ml-2 text-green-600 font-semibold">✅ Completed</span>
// // // //                     )}
// // // //                   </p>

// // // //                 </div>

// // // //                 <button
// // // //                   onClick={() => navigate(`/start-workout/${regiment.regiment_id}/${day.workout_id}`)}
// // // //                   className="flex-shrink-0 flex items-center gap-1 text-sm px-4 py-1.5 bg-[#4B9CD3] text-white rounded-md hover:bg-blue-600 transition-all duration-200"
// // // //                 >
// // // //                   <Play className="h-4 w-4"/> Start
// // // //                 </button>
// // // //               </div>
// // // //               {expandedWorkoutId === day.workout_id && (
// // // //                 <div className="mt-2 bg-gray-50 p-3 rounded border">
// // // //                   <h4 className="text-gray-700 font-semibold mb-2">Exercises:</h4>

// // // //                   <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scrollbar-hide py-2">
// // // //                     {workoutDetails[day.workout_id]?.structure?.length > 0 ? (
// // // //                       workoutDetails[day.workout_id].structure.map((exercise, idx) => (
// // // //                         <div
// // // //                           key={idx}
// // // //                           className="min-w-full sm:min-w-[300px] p-3 border rounded bg-white shadow-sm flex-shrink-0 snap-center"
// // // //                         >
// // // //                           <p className="text-blue-700 font-medium text-lg mb-2">
// // // //                             🔹 {exercise.name}
// // // //                           </p>

// // // //                           {exercise.sets && Object.keys(exercise.sets).length > 0 ? (
// // // //                             <ul className="ml-2 text-sm text-gray-800 list-disc space-y-1">
// // // //                               {Object.values(exercise.sets).map((set, i) => {
// // // //                                 const parts = [];

// // // //                                 if (set.reps) parts.push(`${set.reps} reps`);
// // // //                                 if (set.weight) parts.push(`${set.weight}${exercise.weight_unit || "kg"}`);
// // // //                                 if (set.time) parts.push(`${set.time}${exercise.time_unit || " sec"}`);
// // // //                                 if (set.laps) parts.push(`${set.laps} lap${set.laps > 1 ? "s" : ""}${exercise.laps_unit ? ` of ${exercise.laps_unit}` : ""}`);

// // // //                                 return <li key={i}>{parts.join(", ")}</li>;
// // // //                               })}
// // // //                             </ul>
// // // //                           ) : (
// // // //                             <p className="text-gray-500 text-sm ml-2">No sets defined</p>
// // // //                           )}
// // // //                         </div>
// // // //                       ))
// // // //                     ) : (
// // // //                       <p className="text-sm text-gray-500">No exercises found.</p>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );

// // // //   const renderLogCard = (regiment, logs, workoutDetails) => (
// // // //     <div
// // // //       key={regiment.regiment_id}
// // // //       className="bg-white shadow rounded-lg mb-4 p-1 border"
// // // //     >
// // // //       <h2
// // // //         className="text-xl font-semibold cursor-pointer text-[#4B9CD3] hover:text-blue-500 "
// // // //         onClick={() => toggleRegiment(regiment.regiment_id)}
// // // //       >
// // // //         {regiment.name}
// // // //         <span className="text-sm text-gray-500 ml-2">({logs.length} logs)</span>
// // // //       </h2>

// // // //       {expandedRegimentId === regiment.regiment_id && (
// // // //         <div className="mt-3 space-y-4">
// // // //           {logs
// // // //             .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
// // // //             .map((log) => (
// // // //               <div
// // // //                 key={log.workout_log_id}
// // // //                 className="p-3 border rounded-md bg-gray-50"
// // // //               >
// // // //                 <p><strong>Date:</strong> {new Date(log.log_date).toLocaleDateString("en-GB", {
// // // //                   day: "2-digit",
// // // //                   month: "short",
// // // //                   year: "numeric"
// // // //                 })}</p>

// // // //                 <p>
// // // //                   <strong>Workout:</strong> {log.planned_workout_name}
// // // //                 </p>
// // // //                 <p>
// // // //                   <strong>Score:</strong> {log.score}
// // // //                 </p>

// // // //                 {log.actual_workout?.length > 0 ? (
// // // //                   <div className="mt-2">
// // // //                     <h4 className="font-semibold text-gray-700 mb-2">Exercises:</h4>

// // // //                     {/* 💡 Horizontal scrollable list of exercises */}
// // // //                     <div className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory">
// // // //                       {log.actual_workout.map((actualExercise, index) => {
// // // //                         const plannedWorkout = workoutDetails[log.planned_workout_id];
// // // //                         const plannedExercise = plannedWorkout?.structure?.find(
// // // //                           (ex) => ex.exercise_id === actualExercise.exercise_id
// // // //                         );

// // // //                         return (
// // // //                           <div
// // // //                             key={index}
// // // //                             className="min-w-full sm:min-w-[250px] p-3 border rounded bg-white shadow-sm flex-shrink-0 snap-center"
// // // //                           >
// // // //                             <p className="font-semibold text-[#4B9CD3] mb-1 text-lg">
// // // //                               {plannedExercise?.name || `Exercise ${actualExercise.exercise_id}`}
// // // //                             </p>

// // // //                             {(plannedExercise?.sets || actualExercise.sets) ? (
// // // //                               <div className="grid grid-cols-2 gap-4 text-sm">
// // // //                                 <div>
// // // //                                   <p className="font-semibold text-green-600 mb-1">Planned</p>
// // // //                                   <ul className="list-disc ml-4">
// // // //                                     {Object.entries(plannedExercise?.sets || {}).map(([setKey, set]) => (
// // // //                                       <li key={setKey}>
// // // //                                         {set.reps ? `${set.reps} reps ` : ""}
// // // //                                         {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg"}` : ""}
// // // //                                         {set.time ? `${set.time} sec ` : ""}
// // // //                                         {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
// // // //                                       </li>
// // // //                                     ))}
// // // //                                   </ul>
// // // //                                 </div>

// // // //                                 <div>
// // // //                                   <p className="font-semibold text-blue-600 mb-1">Actual</p>
// // // //                                   <ul className="list-disc ml-4">
// // // //                                     {Object.entries(actualExercise.sets || {}).map(([setKey, set]) => (
// // // //                                       <li key={setKey}>
// // // //                                         {set.reps ? `${set.reps} reps ` : ""}
// // // //                                         {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg"}` : ""}
// // // //                                         {set.time ? `${set.time} sec ` : ""}
// // // //                                         {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
// // // //                                       </li>
// // // //                                     ))}
// // // //                                   </ul>
// // // //                                 </div>
// // // //                               </div>
// // // //                             ) : (
// // // //                               <p className="text-gray-500 ml-4">No set data available</p>
// // // //                             )}
// // // //                           </div>
// // // //                         );
// // // //                       })}
// // // //                     </div>
// // // //                   </div>
// // // //                 ) : (
// // // //                   <p className="text-sm text-gray-500 mt-2">
// // // //                     No actual workout data recorded.
// // // //                   </p>
// // // //                 )}
// // // //               </div>
// // // //             ))}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // //   return (
// // // //     <div className="max-w-5xl mx-auto mt-8 px-4 bg-white min-h-screen">
// // // //       <h1 className="text-3xl font-bold mb-4 text-[#4B9CD3]">Workout Manager</h1>

// // // //       <div className="flex justify-between items-center mb-4">
// // // //         <button
// // // //           onClick={() => navigate("/create-regiment")}
// // // //           className="bg-[#4B9CD3] text-white px-4 py-2 rounded hover:bg-blue-500"
// // // //         >
// // // //           Create Regiment
// // // //         </button>
// // // //         <button
// // // //           onClick={() => setShowLogs((prev) => !prev)}
// // // //           className="bg-[#4B9CD3] text-white px-4 py-2 rounded hover:bg-blue-500"
// // // //         >
// // // //           {showLogs ? "View Regiments" : "View Workout Logs"}
// // // //         </button>
// // // //       </div>

// // // //       {error && <p className="text-red-600">{error}</p>}

// // // //       <input
// // // //         type="text"
// // // //         placeholder="Search by regiment name..."
// // // //         value={searchQuery}
// // // //         onChange={(e) => setSearchQuery(e.target.value)}
// // // //         className="mb-4 p-2 border border-gray-300 rounded w-full"
// // // //       />

// // // //       {!showLogs && (
// // // //         <>
// // // //           {!showLogs && (
// // // //             <>
// // // //               <h2 className="text-2xl font-bold mb-2 text-orange-600">
// // // //                 Current Planned Regiments
// // // //               </h2>
// // // //               {currentPlannedRegiments.length > 0 ? (
// // // //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // //                   {currentPlannedRegiments
// // // //                     .filter((r) =>
// // // //                       r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // //                     )
// // // //                     .map((regiment) => renderRegimentCard(regiment, true, workoutDetails))}
// // // //                 </div>
// // // //               ) : (
// // // //                 <p className="text-gray-500 italic mb-4">No regiments present here.</p>
// // // //               )}
// // // //             </>
// // // //           )}
// // // //           {!showLogs && (
// // // //             <>
// // // //               <h2 className="text-2xl font-bold mb-2 text-green-600">
// // // //                 Completed Regiments
// // // //               </h2>
// // // //               {completedRegiments.length > 0 ? (
// // // //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // //                   {completedRegiments
// // // //                     .filter((r) =>
// // // //                       r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // //                     )
// // // //                     .map((regiment) => renderRegimentCard(regiment, true, workoutDetails))}
// // // //                 </div>
// // // //               ) : (
// // // //                 <p className="text-gray-500 italic mb-4">No regiments present here.</p>
// // // //               )}
// // // //             </>
// // // //           )}
// // // //           <h2 className="text-2xl font-bold mb-2 text-purple-600">
// // // //             Recommended Regiments
// // // //           </h2>
// // // //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // //             {recentRegiments
// // // //               .filter((r) =>
// // // //                 !currentPlannedIds.has(r.regiment_id) &&
// // // //                 !completedIds.has(r.regiment_id)
// // // //               )
// // // //               .filter((r) =>
// // // //                 r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // //               )
// // // //               .map((regiment) => renderRegimentCard(regiment, true, workoutDetails))}

// // // //           </div>

// // // //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // //             {userRegiments
// // // //               .filter((r) =>
// // // //                 !currentPlannedIds.has(r.regiment_id) &&
// // // //                 !completedIds.has(r.regiment_id) &&
// // // //                 !recentRegiments.some(rr => rr.regiment_id === r.regiment_id)
// // // //               )
// // // //               .filter((r) =>
// // // //                 r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // //               )
// // // //               .map((regiment) => renderRegimentCard(regiment, false, workoutDetails))}
// // // //           </div>
// // // //         </>
// // // //       )}

// // // //       {showLogs && (
// // // //         <>
// // // //           <h2 className="text-2xl font-bold mb-4 text-purple-600">
// // // //             Workout Logs
// // // //           </h2>
// // // //           {[...systemRegiments, ...userRegiments]
// // // //             .filter((r) =>
// // // //               r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // //             )
// // // //             .map((regiment) => {
// // // //               const logs = workoutLogs.filter(
// // // //                 (log) => log.regiment_id === regiment.regiment_id
// // // //               );
// // // //               if (logs.length === 0) return null;
// // // //               return renderLogCard(regiment, logs, workoutDetails);
// // // //             })}
// // // //         </>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default Workout_Management;


// // // import { useCallback, useEffect, useRef, useState } from "react";
// // // import axios from "axios";
// // // import { useNavigate } from "react-router-dom";
// // // import { useAuth } from "../../AuthProvider";
// // // import { Trash2, Pencil, Play, ChevronDown, ChevronUp } from 'lucide-react';

// // // const API_URL = import.meta.env.VITE_BACKEND_URL;

// // // const Workout_Management = () => {
// // //   const [regiments, setRegiments] = useState([]);
// // //   const [workoutLogs, setWorkoutLogs] = useState([]);
// // //   const [workoutNames, setWorkoutNames] = useState({});
// // //   const [workoutDetails, setWorkoutDetails] = useState({});
// // //   const [logCounts, setLogCounts] = useState({});
// // //   const [expandedRegimentId, setExpandedRegimentId] = useState(null);
// // //   const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
// // //   const [searchQuery, setSearchQuery] = useState("");
// // //   const [showLogs, setShowLogs] = useState(false);
// // //   const [error, setError] = useState("");
// // //   const [recentRegiments, setRecentRegiments] = useState([]);
// // //   const [currentPlannedRegiments, setCurrentPlannedRegiments] = useState([]);
// // //   const [completedRegiments, setCompletedRegiments] = useState([]);
// // //   const [completedWorkoutIds, setCompletedWorkoutIds] = useState(new Set());
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const [deletingRegiment, setDeletingRegiment] = useState(null);
// // //   const [visibleIndex, setVisibleIndex] = useState(0);

// // //   const navigate = useNavigate();
// // //   const { uid } = useAuth();
// // //   const userId = Number(uid);
// // //   const scrollRef = useRef(null);

// // //   const getCurrentPlannedRegiments = (regiments, logs) => {
// // //     const completedMap = {};

// // //     logs.forEach((log) => {
// // //       if (!completedMap[log.regiment_id]) {
// // //         completedMap[log.regiment_id] = new Set();
// // //       }
// // //       completedMap[log.regiment_id].add(log.planned_workout_id);
// // //     });

// // //     return regiments.filter((reg) => {
// // //       const completedWorkouts = completedMap[reg.regiment_id];
// // //       if (!completedWorkouts) return false;

// // //       const allWorkouts = reg.workout_structure.map((w) => w.workout_id);
// // //       return allWorkouts.some((id) => !completedWorkouts.has(id));
// // //     });
// // //   };

// // //   const getCompletedRegiments = (regiments, logs) => {
// // //     const completedMap = {};

// // //     logs.forEach((log) => {
// // //       if (!completedMap[log.regiment_id]) {
// // //         completedMap[log.regiment_id] = new Set();
// // //       }
// // //       completedMap[log.regiment_id].add(log.planned_workout_id);
// // //     });

// // //     return regiments.filter((reg) => {
// // //       const completedWorkouts = completedMap[reg.regiment_id] || new Set();
// // //       const allWorkoutIds = reg.workout_structure.map((w) => w.workout_id);
// // //       return allWorkoutIds.every((id) => completedWorkouts.has(id));
// // //     });
// // //   };

// // //   const handleScroll = () => {
// // //     if (scrollRef.current) {
// // //       const scrollLeft = scrollRef.current.scrollLeft;
// // //       const itemWidth = scrollRef.current.clientWidth;
// // //       const newIndex = Math.round(scrollLeft / itemWidth);
// // //       setVisibleIndex(newIndex);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       setIsLoading(true);
// // //       try {
// // //         const regRes = await axios.get(`${API_URL}/workouts/regiments`);
// // //         const regimentsData = regRes.data.items || [];
// // //         setRegiments(regimentsData);

// // //         const recentSystemRegiments = regimentsData
// // //           .filter((r) => Number(r.created_by) !== userId)
// // //           .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
// // //           .slice(0, 5);
// // //         setRecentRegiments(recentSystemRegiments);

// // //         const workoutIds = new Set();
// // //         regimentsData.forEach((reg) => {
// // //           reg.workout_structure.forEach((day) => {
// // //             if (day.workout_id) workoutIds.add(day.workout_id);
// // //           });
// // //         });

// // //         const workoutDetailsMap = {};
// // //         await Promise.all(
// // //           [...workoutIds].map(async (id) => {
// // //             const res = await axios.get(`${API_URL}/workouts/${id}`);
// // //             const workout = res.data.item;

// // //             const detailedExercises = workout.structure.map((ex) => {
// // //               return {
// // //                 ...ex,
// // //                 name: ex.exercise_details?.name || `Exercise ${ex.exercise_id}`,
// // //                 weight_unit: ex.weight_unit || "",
// // //                 time_unit: ex.time_unit || "sec",
// // //                 lap_unit: ex.lap_unit || "",
// // //               };
// // //             });
// // //             workoutDetailsMap[id] = { ...workout, structure: detailedExercises };
// // //           })
// // //         );
// // //         setWorkoutDetails(workoutDetailsMap);

// // //         const workoutNameMap = {};
// // //         Object.entries(workoutDetailsMap).forEach(([id, workout]) => {
// // //           workoutNameMap[id] = workout.name;
// // //         });
// // //         setWorkoutNames(workoutNameMap);

// // //         const logRes = await axios.get(`${API_URL}/workouts/logs/user/${userId}`);
// // //         const logs = logRes.data.items || [];
// // //         setWorkoutLogs(logs);

// // //         const completedWorkoutIds = new Set(logs.map(log => log.planned_workout_id));
// // //         setCompletedWorkoutIds(completedWorkoutIds);

// // //         const counts = {};
// // //         logs.forEach((log) => {
// // //           counts[log.regiment_id] = (counts[log.regiment_id] || 0) + 1;
// // //         });
// // //         setLogCounts(counts);

// // //         const inProgress = getCurrentPlannedRegiments(regimentsData, logs);
// // //         setCurrentPlannedRegiments(inProgress);

// // //         const completed = getCompletedRegiments(regimentsData, logs);
// // //         setCompletedRegiments(completed);
// // //       } catch (err) {
// // //         console.error(err);
// // //         setError("Failed to load data.");
// // //       } finally {
// // //         setIsLoading(false);
// // //       }
// // //     };

// // //     fetchData();
// // //   }, [API_URL, userId]);

// // //   const currentPlannedIds = new Set(currentPlannedRegiments.map(r => r.regiment_id));
// // //   const completedIds = new Set(completedRegiments.map(r => r.regiment_id));

// // //   const toggleRegiment = (id) => {
// // //     setExpandedRegimentId((prev) => (prev === id ? null : id));
// // //     setExpandedWorkoutId(null);
// // //   };

// // //   const toggleWorkout = useCallback(
// // //     (id) => {
// // //       if (expandedWorkoutId === id) {
// // //         setExpandedWorkoutId(null);
// // //         return;
// // //       }

// // //       if (!workoutDetails[id]) {
// // //         console.warn(`Workout ID ${id} not found in workoutDetails!`);
// // //       }

// // //       setExpandedWorkoutId(id);
// // //     },
// // //     [expandedWorkoutId, workoutDetails]
// // //   );

// // //   const systemRegiments = regiments.filter((r) => Number(r.created_by) !== userId);
// // //   const userRegiments = regiments.filter((r) => Number(r.created_by) === userId);

// // //   const handleDeleteRegiment = async (regimentId, created_by) => {
// // //     if (!window.confirm("Are you sure you want to delete this regiment?")) return;

// // //     setDeletingRegiment(regimentId);
// // //     try {
// // //       if (created_by === userId) {
// // //         await axios.delete(`${API_URL}/workouts/regiments/${regimentId}`);

// // //         // Animate removal
// // //         setTimeout(() => {
// // //           setRegiments(prev => prev.filter(r => r.regiment_id !== regimentId));
// // //           setDeletingRegiment(null);
// // //         }, 300);
// // //       }
// // //     } catch (err) {
// // //       console.error("Failed to delete regiment:", err);
// // //       alert("Failed to delete regiment. Please try again.");
// // //       setDeletingRegiment(null);
// // //     }
// // //   };

// // //   const renderRegimentCard = (regiment, includeLogCount = true, workoutDetails) => (
// // //     <div
// // //       key={regiment.regiment_id}
// // //       className={`bg-white shadow-lg rounded-xl mb-6 border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${deletingRegiment === regiment.regiment_id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
// // //         }`}
// // //       style={{
// // //         background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
// // //       }}
// // //     >
// // //       <div className="p-6">
// // //         <div
// // //           className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer group"
// // //           onClick={() => toggleRegiment(regiment.regiment_id)}
// // //         >
// // //           <div className="flex items-center space-x-3">
// // //             <div className="transition-transform duration-300 group-hover:rotate-180">
// // //               {expandedRegimentId === regiment.regiment_id ? (
// // //                 <ChevronUp className="h-5 w-5 text-[#4B9CD3]" />
// // //               ) : (
// // //                 <ChevronDown className="h-5 w-5 text-[#4B9CD3]" />
// // //               )}
// // //             </div>
// // //             <h2 className="text-xl font-bold text-[#4B9CD3] group-hover:text-blue-600 transition-colors duration-200">
// // //               {regiment.name}
// // //             </h2>
// // //           </div>

// // //           <div className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4 italic">
// // //             <div className="flex flex-wrap items-center gap-2">
// // //               <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
// // //                 {Number(regiment.created_by) === userId ? "Created by you" : `Created by ${regiment.created_by_name || "someone"}`}
// // //               </span>
// // //               <span className="bg-blue-100 px-2 py-1 rounded-full text-xs text-blue-700">
// // //                 Intensity: {regiment.intensity || "N/A"}
// // //               </span>
// // //               {includeLogCount && (
// // //                 <span className="bg-green-100 px-2 py-1 rounded-full text-xs text-green-700">
// // //                   Logged {logCounts[regiment.regiment_id] || 0} times
// // //                 </span>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>

// // //         <div className={`transition-all duration-500 ease-in-out ${expandedRegimentId === regiment.regiment_id
// // //             ? 'max-h-[2000px] opacity-100 mt-6'
// // //             : 'max-h-0 opacity-0 mt-0'
// // //           } overflow-hidden`}>
// // //           {Number(regiment.created_by) === userId && (
// // //             <div className="mb-4 flex flex-wrap gap-3 justify-end animate-fadeIn">
// // //               <button
// // //                 onClick={(e) => {
// // //                   e.stopPropagation();
// // //                   navigate(`/workouts/regiments/${regiment.regiment_id}`);
// // //                 }}
// // //                 className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
// // //               >
// // //                 <Pencil className="h-4 w-4" /> Update
// // //               </button>

// // //               <button
// // //                 onClick={(e) => {
// // //                   e.stopPropagation();
// // //                   handleDeleteRegiment(regiment.regiment_id, regiment.created_by);
// // //                 }}
// // //                 className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
// // //               >
// // //                 <Trash2 className="h-4 w-4" /> Delete
// // //               </button>
// // //             </div>
// // //           )}

// // //           <div className="space-y-3">
// // //             {regiment.workout_structure.map((day, index) => (
// // //               <div
// // //                 key={day.workout_id}
// // //                 className="transform transition-all duration-300 hover:translate-x-2"
// // //                 style={{ animationDelay: `${index * 100}ms` }}
// // //               >
// // //                 <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#4B9CD3] transition-all duration-200">
// // //                   <div
// // //                     className="flex-1 cursor-pointer group"
// // //                     onClick={(e) => {
// // //                       e.stopPropagation();
// // //                       toggleWorkout(day.workout_id);
// // //                     }}
// // //                   >
// // //                     <div className="flex items-center space-x-2">
// // //                       <div className="w-8 h-8 bg-[#4B9CD3] rounded-full flex items-center justify-center text-white font-bold text-sm">
// // //                         {index + 1}
// // //                       </div>
// // //                       <div>
// // //                         <p className="font-semibold text-gray-800 group-hover:text-[#4B9CD3] transition-colors duration-200">
// // //                           {day.name} - {workoutNames[day.workout_id] || "Loading..."}
// // //                         </p>
// // //                         <div className="flex items-center space-x-2 text-sm text-gray-500">
// // //                           <span className="bg-blue-100 px-2 py-1 rounded-full text-xs">
// // //                             Score: {workoutDetails[day.workout_id]?.score || "N/A"}
// // //                           </span>
// // //                           {completedWorkoutIds.has(day.workout_id) && (
// // //                             <span className="bg-green-100 px-2 py-1 rounded-full text-xs text-green-700 animate-pulse">
// // //                               ✅ Completed
// // //                             </span>
// // //                           )}
// // //                         </div>
// // //                       </div>
// // //                     </div>
// // //                   </div>

// // //                   <button
// // //                     onClick={(e) => {
// // //                       e.stopPropagation();
// // //                       navigate(`/start-workout/${regiment.regiment_id}/${day.workout_id}`);
// // //                     }}
// // //                     className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
// // //                   >
// // //                     <Play className="h-4 w-4" /> Start
// // //                   </button>
// // //                 </div>

// // //                 <div className={`transition-all duration-500 ease-in-out ${expandedWorkoutId === day.workout_id
// // //                     ? 'max-h-[1000px] opacity-100 mt-4'
// // //                     : 'max-h-0 opacity-0 mt-0'
// // //                   } overflow-hidden`}>
// // //                   <div className="bg-white p-4 rounded-lg border-2 border-gray-100 shadow-inner">
// // //                     <h4 className="text-gray-700 font-semibold mb-3 flex items-center">
// // //                       <span className="w-2 h-2 bg-[#4B9CD3] rounded-full mr-2"></span>
// // //                       Exercises
// // //                     </h4>

// // //                     <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scrollbar-hide py-2">
// // //                       {workoutDetails[day.workout_id]?.structure?.length > 0 ? (
// // //                         workoutDetails[day.workout_id].structure.map((exercise, idx) => (
// // //                           <div
// // //                             key={idx}
// // //                             className="min-w-full sm:min-w-[320px] p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-md flex-shrink-0 snap-center transform transition-all duration-300 hover:shadow-lg hover:scale-105"
// // //                           >
// // //                             <div className="flex items-center space-x-2 mb-3">
// // //                               <div className="w-8 h-8 bg-gradient-to-r from-[#4B9CD3] to-blue-500 rounded-full flex items-center justify-center">
// // //                                 <span className="text-white font-bold text-sm">{idx + 1}</span>
// // //                               </div>
// // //                               <p className="text-[#4B9CD3] font-semibold text-lg">
// // //                                 {exercise.name}
// // //                               </p>
// // //                             </div>

// // //                             {exercise.sets && Object.keys(exercise.sets).length > 0 ? (
// // //                               <div className="space-y-2">
// // //                                 {Object.values(exercise.sets).map((set, i) => {
// // //                                   const parts = [];
// // //                                   if (set.reps) parts.push(`${set.reps} reps`);
// // //                                   if (set.weight) parts.push(`${set.weight}${exercise.weight_unit || "kg"}`);
// // //                                   if (set.time) parts.push(`${set.time}${exercise.time_unit || " sec"}`);
// // //                                   if (set.laps) parts.push(`${set.laps} lap${set.laps > 1 ? "s" : ""}${exercise.laps_unit ? ` of ${exercise.laps_unit}` : ""}`);

// // //                                   return (
// // //                                     <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
// // //                                       <div className="w-6 h-6 bg-[#4B9CD3] rounded-full flex items-center justify-center">
// // //                                         <span className="text-white font-bold text-xs">{i + 1}</span>
// // //                                       </div>
// // //                                       <span className="text-sm text-gray-700">{parts.join(", ")}</span>
// // //                                     </div>
// // //                                   );
// // //                                 })}
// // //                               </div>
// // //                             ) : (
// // //                               <p className="text-gray-500 text-sm italic">No sets defined</p>
// // //                             )}
// // //                           </div>
// // //                         ))
// // //                       ) : (
// // //                         <p className="text-sm text-gray-500 italic">No exercises found.</p>
// // //                       )}
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );

// // //   const renderLogCard = (regiment, logs, workoutDetails) => (
// // //     <div
// // //       key={regiment.regiment_id}
// // //       className="bg-white shadow-lg rounded-xl mb-6 border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
// // //       style={{
// // //         background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
// // //       }}
// // //     >
// // //       <div className="p-6">
// // //         <div
// // //           className="flex items-center space-x-3 cursor-pointer group"
// // //           onClick={() => toggleRegiment(regiment.regiment_id)}
// // //         >
// // //           <div className="transition-transform duration-300 group-hover:rotate-180">
// // //             {expandedRegimentId === regiment.regiment_id ? (
// // //               <ChevronUp className="h-5 w-5 text-[#4B9CD3]" />
// // //             ) : (
// // //               <ChevronDown className="h-5 w-5 text-[#4B9CD3]" />
// // //             )}
// // //           </div>
// // //           <h2 className="text-xl font-bold text-[#4B9CD3] group-hover:text-blue-600 transition-colors duration-200">
// // //             {regiment.name}
// // //           </h2>
// // //           <span className="bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-700 font-medium">
// // //             {logs.length} logs
// // //           </span>
// // //         </div>

// // //         <div className={`transition-all duration-500 ease-in-out ${expandedRegimentId === regiment.regiment_id
// // //             ? 'max-h-[2000px] opacity-100 mt-6'
// // //             : 'max-h-0 opacity-0 mt-0'
// // //           } overflow-hidden`}>
// // //           <div className="space-y-4">
// // //             {logs
// // //               .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
// // //               .map((log, index) => (
// // //                 <div
// // //                   key={log.workout_log_id}
// // //                   className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-white transform transition-all duration-300 hover:shadow-md hover:border-[#4B9CD3]"
// // //                   style={{ animationDelay: `${index * 100}ms` }}
// // //                 >
// // //                   <div className="flex flex-wrap gap-4 mb-3">
// // //                     <div className="flex items-center space-x-2">
// // //                       <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
// // //                       <span className="font-semibold text-gray-700">Date:</span>
// // //                       <span className="text-gray-600">
// // //                         {new Date(log.log_date).toLocaleDateString("en-GB", {
// // //                           day: "2-digit",
// // //                           month: "short",
// // //                           year: "numeric"
// // //                         })}
// // //                       </span>
// // //                     </div>
// // //                     <div className="flex items-center space-x-2">
// // //                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
// // //                       <span className="font-semibold text-gray-700">Workout:</span>
// // //                       <span className="text-gray-600">{log.planned_workout_name}</span>
// // //                     </div>
// // //                     <div className="flex items-center space-x-2">
// // //                       <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
// // //                       <span className="font-semibold text-gray-700">Score:</span>
// // //                       <span className="bg-yellow-100 px-2 py-1 rounded-full text-sm text-yellow-700 font-medium">
// // //                         {log.score}
// // //                       </span>
// // //                     </div>
// // //                   </div>

// // //                   {log.actual_workout?.length > 0 ? (
// // //                     <div className="mt-4">
// // //                       <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
// // //                         <span className="w-2 h-2 bg-[#4B9CD3] rounded-full mr-2"></span>
// // //                         Exercises
// // //                       </h4>

// // //                       <div
// // //                         ref={scrollRef}
// // //                         onScroll={handleScroll}
// // //                         className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory scrollbar-hide"
// // //                       >
// // //                         {log.actual_workout.map((actualExercise, index) => {
// // //                           const plannedWorkout = workoutDetails[log.planned_workout_id];
// // //                           const plannedExercise = plannedWorkout?.structure?.find(
// // //                             (ex) => ex.exercise_id === actualExercise.exercise_id
// // //                           );

// // //                           return (
// // //                             <div
// // //                               key={index}
// // //                               className="min-w-full sm:min-w-[300px] p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex-shrink-0 snap-center transform transition-all duration-300 hover:shadow-md hover:scale-105"
// // //                             >
// // //                               <p className="font-semibold text-[#4B9CD3] mb-3 text-lg flex items-center">
// // //                                 <span className="w-6 h-6 bg-[#4B9CD3] rounded-full flex items-center justify-center mr-2">
// // //                                   <span className="text-white font-bold text-xs">{index + 1}</span>
// // //                                 </span>
// // //                                 {plannedExercise?.name || `Exercise ${actualExercise.exercise_id}`}
// // //                               </p>

// // //                               {(plannedExercise?.sets || actualExercise.sets) ? (
// // //                                 <div className="grid grid-cols-2 gap-4 text-sm">
// // //                                   <div>
// // //                                     <p className="font-semibold text-green-600 mb-2 flex items-center">
// // //                                       <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
// // //                                       Planned
// // //                                     </p>
// // //                                     <div className="space-y-1">
// // //                                       {Object.entries(plannedExercise?.sets || {}).map(([setKey, set]) => (
// // //                                         <div key={setKey} className="p-2 bg-green-50 rounded-md">
// // //                                           {set.reps ? `${set.reps} reps ` : ""}
// // //                                           {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg"}` : ""}
// // //                                           {set.time ? `${set.time} sec ` : ""}
// // //                                           {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
// // //                                         </div>
// // //                                       ))}
// // //                                     </div>
// // //                                   </div>

// // //                                   <div>
// // //                                     <p className="font-semibold text-blue-600 mb-2 flex items-center">
// // //                                       <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
// // //                                       Actual
// // //                                     </p>
// // //                                     <div className="space-y-1">
// // //                                       {Object.entries(actualExercise.sets || {}).map(([setKey, set]) => (
// // //                                         <div key={setKey} className="p-2 bg-blue-50 rounded-md">
// // //                                           {set.reps ? `${set.reps} reps ` : ""}
// // //                                           {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg"}` : ""}
// // //                                           {set.time ? `${set.time} sec ` : ""}
// // //                                           {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
// // //                                         </div>
// // //                                       ))}
// // //                                     </div>
// // //                                   </div>
// // //                                 </div>
// // //                               ) : (
// // //                                 <p className="text-gray-500 text-sm italic">No set data available</p>
// // //                               )}
// // //                             </div>
// // //                           );
// // //                         })}
// // //                       </div>

// // //                       <div className="flex justify-center mt-3 gap-1">
// // //                         {log.actual_workout.slice(0, 3).map((_, idx) => (
// // //                           <span
// // //                             key={idx}
// // //                             className={`w-2 h-2 rounded-full transition-all duration-300 ${visibleIndex === idx ? 'bg-blue-500 scale-125' : 'bg-gray-300'
// // //                               }`}
// // //                           />
// // //                         ))}
// // //                         {log.actual_workout.length > 3 && visibleIndex >= 3 && (
// // //                           <span className="ml-2 text-sm text-gray-500 font-medium">
// // //                             +{log.actual_workout.length - visibleIndex}
// // //                           </span>
// // //                         )}
// // //                       </div>
// // //                     </div>
// // //                   ) : (
// // //                     <p className="text-sm text-gray-500 italic mt-2">
// // //                       No actual workout data recorded.
// // //                     </p>
// // //                   )}
// // //                 </div>
// // //               ))}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );

// // //   return (
// // //     <div className="max-w-5xl mx-auto mt-8 px-4 bg-white min-h-screen">
// // //       <div className="animate-fadeIn">
// // //         <h1 className="text-4xl font-bold mb-6 text-[#4B9CD3] text-center">
// // //           Workout Manager
// // //         </h1>

// // //         <div className="flex justify-between items-center mb-6">
// // //           <button
// // //             onClick={() => navigate("/create-regiment")}
// // //             className="bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
// // //           >
// // //             Create Regiment
// // //           </button>
// // //           <button
// // //             onClick={() => setShowLogs((prev) => !prev)}
// // //             className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
// // //           >
// // //             {showLogs ? "View Regiments" : "View Workout Logs"}
// // //           </button>
// // //         </div>

// // //         {error && <p className="text-red-600 text-center">{error}</p>}

// // //         <input
// // //           type="text"
// // //           placeholder="Search by regiment name..."
// // //           value={searchQuery}
// // //           onChange={(e) => setSearchQuery(e.target.value)}
// // //           className="mb-6 p-3 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
// // //         />

// // //         {!showLogs && (
// // //           <>
// // //             <h2 className="text-2xl font-bold mb-4 text-orange-600">
// // //               Current Planned Regiments
// // //             </h2>
// // //             {currentPlannedRegiments.length > 0 ? (
// // //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // //                 {currentPlannedRegiments
// // //                   .filter((r) =>
// // //                     r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // //                   )
// // //                   .map((regiment) =>
// // //                     renderRegimentCard(regiment, true, workoutDetails)
// // //                   )}
// // //               </div>
// // //             ) : (
// // //               <p className="text-gray-500 italic mb-6">
// // //                 No regiments present here.
// // //               </p>
// // //             )}

// // //             <h2 className="text-2xl font-bold mb-4 text-green-600">
// // //               Completed Regiments
// // //             </h2>
// // //             {completedRegiments.length > 0 ? (
// // //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // //                 {completedRegiments
// // //                   .filter((r) =>
// // //                     r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // //                   )
// // //                   .map((regiment) =>
// // //                     renderRegimentCard(regiment, true, workoutDetails)
// // //                   )}
// // //               </div>
// // //             ) : (
// // //               <p className="text-gray-500 italic mb-6">
// // //                 No regiments present here.
// // //               </p>
// // //             )}

// // //             <h2 className="text-2xl font-bold mb-4 text-purple-600">
// // //               Recommended Regiments
// // //             </h2>
// // //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // //               {recentRegiments
// // //                 .filter(
// // //                   (r) =>
// // //                     !currentPlannedIds.has(r.regiment_id) &&
// // //                     !completedIds.has(r.regiment_id)
// // //                 )
// // //                 .filter((r) =>
// // //                   r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // //                 )
// // //                 .map((regiment) =>
// // //                   renderRegimentCard(regiment, true, workoutDetails)
// // //                 )}
// // //             </div>

// // //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
// // //               {userRegiments
// // //                 .filter(
// // //                   (r) =>
// // //                     !currentPlannedIds.has(r.regiment_id) &&
// // //                     !completedIds.has(r.regiment_id) &&
// // //                     !recentRegiments.some(
// // //                       (rr) => rr.regiment_id === r.regiment_id
// // //                     )
// // //                 )
// // //                 .filter((r) =>
// // //                   r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // //                 )
// // //                 .map((regiment) =>
// // //                   renderRegimentCard(regiment, false, workoutDetails)
// // //                 )}
// // //             </div>
// // //           </>
// // //         )}

// // //         {showLogs && (
// // //           <>
// // //             <h2 className="text-2xl font-bold mb-6 text-purple-600">
// // //               Workout Logs
// // //             </h2>
// // //             {[...systemRegiments, ...userRegiments]
// // //               .filter((r) =>
// // //                 r.name.toLowerCase().includes(searchQuery.toLowerCase())
// // //               )
// // //               .map((regiment) => {
// // //                 const logs = workoutLogs.filter(
// // //                   (log) => log.regiment_id === regiment.regiment_id
// // //                 );
// // //                 if (logs.length === 0) return null;
// // //                 return renderLogCard(regiment, logs, workoutDetails);
// // //               })}
// // //           </>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Workout_Management;


// // import React, { useEffect, useState } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { useAuth } from "../../AuthProvider";
// // import { Check, Play, Pause, X, ArrowLeft, Timer } from "lucide-react";
// // import confetti from "canvas-confetti";

// // const API_URL = import.meta.env.VITE_BACKEND_URL;

// // const StartWorkout = () => {
// //   const { regimenId, workoutId } = useParams();
// //   const { uid } = useAuth();
// //   const navigate = useNavigate();

// //   const [workout, setWorkout] = useState(null);
// //   const [regiments, setRegiments] = useState([]);
// //   const [error, setError] = useState("");
// //   const [checkedSets, setCheckedSets] = useState({});
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [addedSets, setAddedSets] = useState({}); // { [exerciseIndex]: [setNumbers] }


// //   const [logData, setLogData] = useState({
// //     user_id: uid,
// //     regiment_id: regimenId ? Number(regimenId) : null,
// //     actual_workout: [],
// //   });

// //   useEffect(() => {
// //     if (!uid) return;

// //     const fetchData = async () => {
// //       try {
// //         setIsLoading(true);
// //         const [workoutRes, regimentsRes] = await Promise.all([
// //           axios.get(`${API_URL}/workouts/${workoutId}`),
// //           axios.get(`${API_URL}/workouts/regiments`),
// //         ]);

// //         const workoutData = workoutRes.data.item;
// //         setWorkout(workoutData);
// //         setRegiments(regimentsRes.data.items || []);

// //         const initChecked = {};
// //         const initActualWorkout = [];

// //         workoutData.structure.forEach((exercise, eIdx) => {
// //           initChecked[eIdx] = {};

// //           const actualExercise = {
// //             exercise_id: exercise.exercise_id,
// //             sets: {},
// //           };

// //           Object.entries(exercise.sets).forEach(([setKey, setVal]) => {
// //             initChecked[eIdx][setKey] = false;

// //             const actualSet = {};
// //             if (setVal.reps !== undefined) actualSet.reps = setVal.reps;
// //             if (setVal.weight !== undefined) actualSet.weight = setVal.weight;
// //             if (setVal.time !== undefined) actualSet.time = setVal.time;
// //             if (setVal.laps !== undefined) actualSet.laps = setVal.laps;

// //             actualExercise.sets[setKey] = actualSet;
// //           });

// //           initActualWorkout.push(actualExercise);
// //         });

// //         setCheckedSets(initChecked);
// //         setLogData((prev) => ({
// //           ...prev,
// //           actual_workout: initActualWorkout,
// //         }));
// //       } catch (err) {
// //         console.error("Error loading data:", err);
// //         setError("Failed to load workout data.");
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchData();
// //   }, [workoutId, uid]);

// //   const [timer, setTimer] = useState({
// //     hours: 0,
// //     minutes: 0,
// //     seconds: 0,
// //     isRunning: false,
// //     intervalId: null,
// //   });

// //   const [selectedTimer, setSelectedTimer] = useState(null);

// //   const handleSetCheck = (eIdx, setNumber) => {
// //     setCheckedSets((prev) => ({
// //       ...prev,
// //       [eIdx]: {
// //         ...prev[eIdx],
// //         [setNumber]: !prev[eIdx][setNumber],
// //       },
// //     }));
// //   };

// //   const allExercisesComplete = () => {
// //     return workout?.structure.every((exercise, eIdx) =>
// //       Object.keys(exercise.sets).every((setKey) => checkedSets?.[eIdx]?.[setKey])
// //     );
// //   };

// //   const startTimer = () => {
// //     if (timer.isRunning) return;

// //     const intervalId = setInterval(() => {
// //       setTimer(prev => {
// //         let { hours, minutes, seconds } = prev;

// //         if (seconds > 0) {
// //           seconds--;
// //         } else if (minutes > 0) {
// //           minutes--;
// //           seconds = 59;
// //         } else if (hours > 0) {
// //           hours--;
// //           minutes = 59;
// //           seconds = 59;
// //         } else {
// //           clearInterval(intervalId);

// //           if (selectedTimer) {
// //             const { eIdx, setNumber } = selectedTimer;
// //             setCheckedSets(prevChecked => ({
// //               ...prevChecked,
// //               [eIdx]: {
// //                 ...prevChecked[eIdx],
// //                 [setNumber]: true,
// //               },
// //             }));

// //             setLogData(prev => {
// //               const updated = [...prev.actual_workout];
// //               const exercise = workout.structure[eIdx];
// //               const setTime = exercise.sets[setNumber].time;
// //               updated[eIdx].sets[setNumber].time = setTime;
// //               return { ...prev, actual_workout: updated };
// //             });
// //           }

// //           return { ...prev, isRunning: false };
// //         }

// //         return { hours, minutes, seconds, isRunning: true, intervalId };
// //       });
// //     }, 1000);

// //     setTimer(prev => ({ ...prev, isRunning: true, intervalId }));
// //   };

// //   const stopTimer = () => {
// //     if (!timer.isRunning) return;
// //     clearInterval(timer.intervalId);
// //     setTimer(prev => ({ ...prev, isRunning: false, intervalId: null }));
// //   };

// //   const resetTimer = (timeInSeconds) => {
// //     if (timer.intervalId) clearInterval(timer.intervalId);

// //     const minutes = Math.floor(timeInSeconds / 60);
// //     const seconds = timeInSeconds % 60;

// //     setTimer({
// //       hours: 0,
// //       minutes,
// //       seconds,
// //       isRunning: false,
// //       intervalId: null
// //     });
// //   };

// //   const handleSelectTimer = (eIdx, setNumber) => {
// //     const exercise = workout.structure[eIdx];
// //     const set = exercise.sets[setNumber];

// //     if (set.time) {
// //       const timeInSeconds = set.time_unit?.toLowerCase().includes("min")
// //         ? set.time * 60
// //         : set.time;

// //       resetTimer(timeInSeconds);
// //       setSelectedTimer({ eIdx, setNumber });
// //     }
// //   };

// //   const handleActualSetChange = (exerciseIdx, setKey, field, value) => {
// //     const updated = [...logData.actual_workout];
// //     updated[exerciseIdx].sets[setKey][field] = value;
// //     setLogData((prev) => ({ ...prev, actual_workout: updated }));
// //   };

// //   const buildActualWorkoutWithUnits = () => {
// //     return workout.structure.map((exercise, eIdx) => {
// //       const exerciseLog = {
// //         exercise_id: exercise.exercise_id,
// //         sets: {},
// //       };

// //       Object.entries(exercise.sets).forEach(([setKey, plannedSet]) => {
// //         const actualSet = logData.actual_workout[eIdx]?.sets[setKey] || {};

// //         exerciseLog.sets[setKey] = {
// //           reps: actualSet.reps ?? plannedSet.reps,
// //           weight: actualSet.weight ?? plannedSet.weight,
// //           time: actualSet.time ?? plannedSet.time,
// //           laps: actualSet.laps ?? plannedSet.laps,
// //           weight_unit: exercise.weight_unit || "kg",
// //           time_unit: plannedSet.time_unit || "seconds",
// //         };

// //         Object.keys(exerciseLog.sets[setKey]).forEach((key) => {
// //           if (exerciseLog.sets[setKey][key] === undefined) {
// //             delete exerciseLog.sets[setKey][key];
// //           }
// //         });
// //       });

// //       return exerciseLog;
// //     });
// //   };

// //   const handleAddSet = (exerciseIndex) => {
// //     const currentSets = workout.structure[exerciseIndex].sets;
// //     const newSetNumber = (Math.max(...Object.keys(currentSets).map(Number)) + 1).toString();

// //     const { weight_unit = "kg", laps_unit = "", time_unit = "seconds" } = workout.structure[exerciseIndex];

// //     // Update workout
// //     setWorkout((prevWorkout) => {
// //       const newWorkout = { ...prevWorkout };
// //       const sets = newWorkout.structure[exerciseIndex].sets;

// //       sets[newSetNumber] = {
// //         reps: "",
// //         weight: "",
// //         time: "",
// //         laps: "",
// //         weight_unit,
// //         time_unit,
// //         laps_unit,
// //       };

// //       return newWorkout;
// //     });

// //     // Update logData
// //     setLogData((prevLogData) => {
// //       const updated = [...prevLogData.actual_workout];
// //       updated[exerciseIndex].sets[newSetNumber] = {
// //         reps: "",
// //         weight: "",
// //         time: "",
// //         laps: "",
// //       };
// //       return { ...prevLogData, actual_workout: updated };
// //     });

// //     // Update checkedSets
// //     setCheckedSets((prevChecked) => {
// //       const updated = { ...prevChecked };
// //       updated[exerciseIndex] = {
// //         ...updated[exerciseIndex],
// //         [newSetNumber]: false,
// //       };
// //       return updated;
// //     });

// //     // Track added sets (optional if you use remove functionality)
// //     setAddedSets((prev) => {
// //       const current = prev[exerciseIndex] || [];
// //       return {
// //         ...prev,
// //         [exerciseIndex]: [...current, newSetNumber],
// //       };
// //     });
// //   };

// //   const handleRemoveSet = (exerciseIndex, setNumber) => {
// //     setWorkout((prevWorkout) => {
// //       const updatedWorkout = { ...prevWorkout };
// //       delete updatedWorkout.structure[exerciseIndex].sets[setNumber];
// //       return updatedWorkout;
// //     });

// //     setLogData((prev) => {
// //       const updated = [...prev.actual_workout];
// //       delete updated[exerciseIndex].sets[setNumber];
// //       return { ...prev, actual_workout: updated };
// //     });

// //     setCheckedSets((prev) => {
// //       const updated = { ...prev };
// //       delete updated[exerciseIndex][setNumber];
// //       return updated;
// //     });

// //     setAddedSets((prev) => {
// //       const updatedList = (prev[exerciseIndex] || []).filter((num) => num !== setNumber);
// //       return {
// //         ...prev,
// //         [exerciseIndex]: updatedList,
// //       };
// //     });
// //   };

// //   const handleFinish = async () => {
// //     if (!uid) {
// //       alert("User not authenticated. Please log in.");
// //       return;
// //     }

// //     try {
// //       await axios.put(`${API_URL}/workouts/${workoutId}`, {
// //         current_user_id: uid,
// //       });

// //       const actualWorkoutWithUnits = buildActualWorkoutWithUnits();

// //       const payload = {
// //         user_id: Number(uid),
// //         regiment_id: logData.regiment_id ? Number(logData.regiment_id) : null,
// //         planned_workout_id: Number(workoutId),
// //         actual_workout: actualWorkoutWithUnits,
// //       };

// //       await axios.post(`${API_URL}/workouts/logs`, payload);

// //       if (regimenId) {
// //         const regimentRes = await axios.get(`${API_URL}/workouts/regiments/${regimenId}`);
// //         const regiment = regimentRes.data.item;

// //         const cleanedStructure = regiment.workout_structure.map((day) => ({
// //           name: day.name,
// //           workout_id: day.workout_id,
// //         }));

// //         await axios.put(`${API_URL}/workouts/regiments/${regimenId}`, {
// //           workout_structure: cleanedStructure,
// //         });
// //       }

// //       // setShowSuccessMessage(true);
// //       confetti({
// //         particleCount: 150,
// //         spread: 90,
// //         origin: { y: 0.6 },
// //       });
// //       navigate("/Workout_Management");
// //     } catch (err) {
// //       console.error("Error finishing workout:", err);
// //       let errorMessage = err.response?.data?.error?.message || err.message;
// //       alert(`Error completing workout: ${errorMessage}`);
// //     }
// //   };

// //   if (error) return <div className="text-red-600 p-4">{error}</div>;
// //   if (isLoading) return (
// //     <div className="flex justify-center items-center h-screen">
// //       <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
// //     </div>
// //   );
// //   if (!workout) return <div className="p-4">Loading workout...</div>;

// //   return (
// //     <div className="max-w-5xl mx-auto px-4 py-8 bg-white min-h-screen">
// //       <button
// //         onClick={() => navigate('/Workout_Management')}
// //         className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition mb-6 font-medium"
// //       >
// //         <ArrowLeft className="h-4 w-4" /> Back to Workouts
// //       </button>

// //       <div className="sticky top-0 z-40 bg-white flex justify-between items-center mb-8 px-4 py-4 shadow-sm border-b border-gray-200">
// //         <h1 className="text-3xl font-bold text-[#4B9CD3] tracking-tight">
// //           {workout.name || "Workout"}
// //         </h1>
// //         <button
// //           onClick={handleFinish}
// //           className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${allExercisesComplete()
// //             ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
// //             : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
// //             } text-white font-medium`}
// //         >
// //           <Check className="h-5 w-5" /> Finish & Log Workout
// //         </button>
// //       </div>

// //       <div className="space-y-6">
// //         {workout.structure.map((exercise, eIdx) => (
// //           <div
// //             key={eIdx}
// //             className="bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl"
// //           >
// //             <div className="p-6">
// //               <h2 className="text-xl font-bold text-[#4B9CD3] mb-4">
// //                 {exercise.exercise_details?.name || `Exercise ${exercise.exercise_id}`}
// //               </h2>

// //               <div className="space-y-4">
// //                 {Object.entries(exercise.sets).map(([setNumber, set]) => {
// //                   const isTime = !!set.time;
// //                   const isChecked = checkedSets?.[eIdx]?.[setNumber];
// //                   const actualSet = logData.actual_workout[eIdx]?.sets[setNumber] || {};
// //                   const weightUnit = exercise.weight_unit || "kg";
// //                   const timeUnit = set.time_unit || "seconds";
// //                   const lapUnit = exercise.laps_unit || "no units";

// //                   return (
// //                     <div
// //                       key={setNumber}
// //                       className={`rounded-xl p-4 shadow-sm border transition-all duration-200 ${isChecked ? "bg-green-50 border-green-300" : "bg-white border-gray-300"}`}
// //                     >
// //                       <div className="flex justify-between items-start mb-3">
// //                         <div>
// //                           <p className="font-medium text-[#4B9CD3]">Set {setNumber}</p>
// //                           <p className="text-sm text-gray-600">
// //                             Planned: {isTime ? `${set.time} ${timeUnit}` : `${set.reps} Reps`}
// //                             {set.weight ? ` / ${set.weight} ${weightUnit}` : ""}
// //                             {set.laps ? ` / ${set.laps} Laps (${lapUnit})` : ""}
// //                           </p>
// //                         </div>
// //                         <div className="flex gap-2 items-center">
// //                           {isTime && (
// //                             <button
// //                               onClick={() => handleSelectTimer(eIdx, setNumber)}
// //                               className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
// //                             >
// //                               <Timer className="h-4 w-4" /> Timer
// //                             </button>
// //                           )}
// //                           <button
// //                             onClick={() => handleSetCheck(eIdx, setNumber)}
// //                             className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${isChecked
// //                               ? "bg-green-500 text-white hover:bg-green-600"
// //                               : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
// //                           >
// //                             {isChecked && <Check className="h-4 w-4" />} Done
// //                           </button>
// //                           {addedSets[eIdx]?.includes(setNumber) && (
// //                             <button
// //                               onClick={() => handleRemoveSet(eIdx, setNumber)}
// //                               className="text-red-500 hover:text-red-700 text-xs font-medium ml-2"
// //                             >
// //                               <X />
// //                             </button>
// //                           )}
// //                         </div>
// //                       </div>

// //                       <div className="border-t pt-3 mt-3">
// //                         <p className="text-sm font-medium text-gray-700 mb-2">Actual Performance:</p>
// //                         <div className="flex flex-wrap gap-3 items-end sm:mt-0 mt-4">
// //                           {"reps" in actualSet && (
// //                             <div className="flex-1 min-w-[70px] space-y-1">
// //                               <label className="block text-xs text-gray-500 font-medium">Reps</label>
// //                               <input
// //                                 type="number"
// //                                 value={actualSet.reps}
// //                                 onChange={(e) => handleActualSetChange(eIdx, setNumber, "reps", e.target.value)}
// //                                 className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
// //                                 min="0"
// //                               />
// //                             </div>
// //                           )}
// //                           {"weight" in actualSet && (
// //                             <div className="flex-1 min-w-[70px] space-y-1">
// //                               <label className="block text-xs text-gray-500 font-medium">Weight</label>
// //                               <input
// //                                 type="number"
// //                                 value={actualSet.weight}
// //                                 onChange={(e) => handleActualSetChange(eIdx, setNumber, "weight", e.target.value)}
// //                                 className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
// //                                 min="0"
// //                                 step="0.1"
// //                               />
// //                             </div>
// //                           )}
// //                           {"weight" in actualSet && (
// //                             <div className="flex-1 min-w-[70px] space-y-1">
// //                               <label className="block text-xs text-gray-500 font-medium">Weight Unit</label>
// //                               <select
// //                                 value={weightUnit}
// //                                 onChange={(e) => handleActualSetChange(eIdx, setNumber, "weight_unit", e.target.value)}
// //                                 className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
// //                               >
// //                                 <option value="kg">kg</option>
// //                                 <option value="lbs">lbs</option>
// //                               </select>
// //                             </div>
// //                           )}
// //                           {"time" in actualSet && (
// //                             <div className="flex-1 min-w-[70px] space-y-1">
// //                               <label className="block text-xs text-gray-500 font-medium">Time</label>
// //                               <input
// //                                 type="number"
// //                                 value={actualSet.time}
// //                                 onChange={(e) => handleActualSetChange(eIdx, setNumber, "time", e.target.value)}
// //                                 className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
// //                                 min="0"
// //                               />
// //                             </div>
// //                           )}
// //                           {"time" in actualSet && (
// //                             <div className="flex-1 min-w-[70px] space-y-1">
// //                               <label className="block text-xs text-gray-500 font-medium">Time Unit</label>
// //                               <select
// //                                 value={timeUnit}
// //                                 onChange={(e) => handleActualSetChange(eIdx, setNumber, "time_unit", e.target.value)}
// //                                 className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
// //                               >
// //                                 <option value="seconds">seconds</option>
// //                                 <option value="minutes">minutes</option>
// //                               </select>
// //                             </div>
// //                           )}
// //                           {"laps" in actualSet && (
// //                             <div className="flex-1 min-w-[70px] space-y-1">
// //                               <label className="block text-xs text-gray-500 font-medium">Laps</label>
// //                               <input
// //                                 type="number"
// //                                 value={actualSet.laps}
// //                                 onChange={(e) => handleActualSetChange(eIdx, setNumber, "laps", e.target.value)}
// //                                 className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
// //                                 min="0"
// //                               />
// //                             </div>
// //                           )}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   );
// //                 })}
// //                 <div className="pt-4">
// //                   <button
// //                     onClick={() => handleAddSet(eIdx)}
// //                     className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline transition"
// //                   >
// //                     + Add Set
// //                   </button>
// //                 </div>
// //                 {selectedTimer && (
// //                   <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white p-6 rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeInUp">
// //                     <div className="flex justify-between items-center mb-4">
// //                       <h3 className="text-lg font-semibold text-gray-800">Timer</h3>
// //                       <button
// //                         onClick={() => {
// //                           stopTimer();
// //                           setSelectedTimer(null);
// //                         }}
// //                         className="text-red-500 hover:text-red-700 transition-colors"
// //                       >
// //                         ✕
// //                       </button>
// //                     </div>

// //                     <div className="flex justify-between mb-6">
// //                       <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
// //                         <p className="text-2xl font-bold">
// //                           {String(timer.hours).padStart(2, '0')}
// //                         </p>
// //                         <p className="text-xs text-gray-500">Hours</p>
// //                       </div>
// //                       <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
// //                         <p className="text-2xl font-bold">
// //                           {String(timer.minutes).padStart(2, '0')}
// //                         </p>
// //                         <p className="text-xs text-gray-500">Minutes</p>
// //                       </div>
// //                       <div className="text-center bg-gray-100 p-4 rounded-lg w-1/3 mx-1">
// //                         <p className="text-2xl font-bold">
// //                           {String(timer.seconds).padStart(2, '0')}
// //                         </p>
// //                         <p className="text-xs text-gray-500">Seconds</p>
// //                       </div>
// //                     </div>

// //                     <div className="flex gap-4">
// //                       <button
// //                         onClick={startTimer}
// //                         disabled={timer.isRunning}
// //                         className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${timer.isRunning
// //                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
// //                           : "bg-blue-500 text-white hover:bg-blue-600 transition"
// //                           }`}
// //                       >
// //                         <Play /> Start
// //                       </button>
// //                       <button
// //                         onClick={stopTimer}
// //                         disabled={!timer.isRunning}
// //                         className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${!timer.isRunning
// //                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
// //                           : "bg-red-500 text-white hover:bg-red-600 transition"
// //                           }`}
// //                       >
// //                         <Pause />Stop
// //                       </button>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       {allExercisesComplete() && (
// //         <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
// //           <button
// //             onClick={handleFinish}
// //             className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-md hover:shadow-xl transition-all animate-bounce"
// //           >
// //             <Check className="h-5 w-5" /> Finish & Log Workout
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );

// // };

// // export default StartWorkout;


