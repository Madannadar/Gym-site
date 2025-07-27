// hooks/useWorkout.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from "../../AuthProvider";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const useWorkout = () => {
  const { uid, authenticated } = useAuth();
  const userId = Number(uid);

  const [regiments, setRegiments] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [workoutDetails, setWorkoutDetails] = useState({});
  const [workoutNames, setWorkoutNames] = useState({});
  const [currentPlannedRegiments, setCurrentPlannedRegiments] = useState([]);
  const [todaysWorkout, setTodaysWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Cache data for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchCurrentRegimentWithFallback = async (userId, regiments, logs) => {
    try {
      const response = await axios.get(`${API_URL}/workouts/user_current_regiment/${userId}`);
      const currentId = response.data.regiment_id;
      if (currentId) return currentId;
    } catch (error) {
      // Fail silently and fallback
    }

    // Fallback logic
    const logsByRegiment = {};
    logs.forEach((log) => {
      if (!logsByRegiment[log.regiment_id]) logsByRegiment[log.regiment_id] = [];
      logsByRegiment[log.regiment_id].push(log);
    });

    for (const regiment of regiments) {
      const regimentLogs = logsByRegiment[regiment.regiment_id] || [];
      const completedWorkoutIds = new Set(regimentLogs.map(log => log.planned_workout_id));
      const allWorkoutIds = regiment.workout_structure.map(w => w.workout_id);
      const isComplete = allWorkoutIds.every(id => completedWorkoutIds.has(id));

      if (!isComplete && regimentLogs.length > 0) {
        return regiment.regiment_id;
      }
    }

    return null;
  };

  const getTodaysWorkoutLogic = (currentRegiment, workoutLogs, workoutDetails) => {
    if (!currentRegiment) return null;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const regimentLogs = workoutLogs.filter(
      (log) => log.regiment_id === currentRegiment.regiment_id
    );

    const todaysLog = regimentLogs.find((log) => {
      const logDate = new Date(log.created_at);
      const logStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, "0")}-${String(logDate.getDate()).padStart(2, "0")}`;
      return logStr === todayStr;
    });

    if (todaysLog) {
      return "completed";
    }

    // Find next uncompleted workout
    const completedWorkoutIds = new Set(regimentLogs.map((log) => log.planned_workout_id));
    const workoutStructure = currentRegiment.workout_structure;

    for (let i = 0; i < workoutStructure.length; i++) {
      const workoutEntry = workoutStructure[i];
      const workoutId = workoutEntry.workout_id;

      if (!completedWorkoutIds.has(workoutId)) {
        return {
          regiment: currentRegiment,
          workoutId: workoutId,
          workoutIndex: i,
          workoutDetails: workoutDetails[workoutId] || null,
        };
      }
    }

    return null;
  };

  const fetchWorkoutData = useCallback(async (logLimit = 20) => {
    if (!authenticated || !uid || isNaN(userId)) {
      setError("Please log in to view workout data.");
      return;
    }

    // Check cache
    if (lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
      return; // Use cached data
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch regiments
      const regRes = await axios.get(`${API_URL}/workouts/regiments`);
      const regimentsData = regRes.data.items || [];
      setRegiments(regimentsData);

      // Fetch workout logs
      const logRes = await axios.get(`${API_URL}/workouts/logs/user/${userId}?limit=${logLimit}&offset=0`);
      const logs = logRes.data.items || [];
      setWorkoutLogs(logs);

      // Fetch current regiment ID with fallback
      const currentRegimentByLogs = await fetchCurrentRegimentWithFallback(userId, regimentsData, logs);

      // Fetch workout details
      const workoutIds = new Set();
      regimentsData.forEach((reg) => {
        reg.workout_structure.forEach((day) => {
          if (day.workout_id) workoutIds.add(day.workout_id);
        });
      });

      const workoutDetailsMap = {};
      await Promise.all(
        [...workoutIds].map(async (id) => {
          try {
            const res = await axios.get(`${API_URL}/workouts/${id}`);
            const workout = res.data.item;
            const intensityObj =
              typeof workout.intensity === "string"
                ? JSON.parse(workout.intensity)
                : workout.intensity || {};

            const detailedExercises = workout.structure.map((ex) => ({
              ...ex,
              name: ex.exercise_details?.name || `Exercise ${ex.exercise_id}`,
              weight_unit: ex.weight_unit || "",
              time_unit: ex.time_unit || "sec",
              lap_unit: ex.lap_unit || "",
            }));

            workoutDetailsMap[id] = {
              ...workout,
              structure: detailedExercises,
              intensity: intensityObj,
            };
          } catch (err) {
            console.warn(`Failed to fetch workout ID ${id}:`, err);
          }
        })
      );

      setWorkoutDetails(workoutDetailsMap);

      // Map workout names
      const workoutNameMap = {};
      Object.entries(workoutDetailsMap).forEach(([id, workout]) => {
        workoutNameMap[id] = workout.name || `Workout ${id}`;
      });
      setWorkoutNames(workoutNameMap);

      // Find current regiment and calculate today's workout
      if (currentRegimentByLogs) {
        const currentRegiment = regimentsData.find(r => r.regiment_id === currentRegimentByLogs);
        if (currentRegiment) {
          setCurrentPlannedRegiments([currentRegiment]);
          const todaysWorkoutResult = getTodaysWorkoutLogic(currentRegiment, logs, workoutDetailsMap);
          setTodaysWorkout(todaysWorkoutResult);
        }
      }

      setLastFetch(Date.now());

    } catch (err) {
      console.error("Error fetching workout data:", err);
      setError("Failed to load workout data.");
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, uid, userId, lastFetch]);

  // Lightweight fetch for just today's workout (for Home page)
  const fetchTodaysWorkoutOnly = useCallback(async () => {
    // If we have cached data, use it
    if (lastFetch && Date.now() - lastFetch < CACHE_DURATION && todaysWorkout !== null) {
      return;
    }

    // Otherwise fetch minimal data needed for today's workout
    await fetchWorkoutData(5); // Fetch minimal logs
  }, [fetchWorkoutData, lastFetch, todaysWorkout]);

  // Full fetch for workout management page
  const fetchFullWorkoutData = useCallback(async (logLimit = 20) => {
    await fetchWorkoutData(logLimit);
  }, [fetchWorkoutData]);

  // Refresh function to force refetch
  const refreshWorkoutData = useCallback(() => {
    setLastFetch(null);
    fetchWorkoutData();
  }, [fetchWorkoutData]);

  return {
    // Data
    regiments,
    workoutLogs,
    workoutDetails,
    workoutNames,
    currentPlannedRegiments,
    todaysWorkout,
    
    // State
    isLoading,
    error,
    
    // Functions
    fetchTodaysWorkoutOnly,
    fetchFullWorkoutData,
    refreshWorkoutData,
    
    // Utility
    lastFetch,
  };
};

// For Home component - simplified hook
export const useTodaysWorkout = () => {
  const {
    todaysWorkout,
    isLoading,
    error,
    fetchTodaysWorkoutOnly,
  } = useWorkout();

  useEffect(() => {
    fetchTodaysWorkoutOnly();
  }, [fetchTodaysWorkoutOnly]);

  return {
    todaysWorkout,
    isLoading,
    error,
    refreshTodaysWorkout: fetchTodaysWorkoutOnly,
  };
};