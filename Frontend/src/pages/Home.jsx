import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [regiments, setRegiments] = useState([]);
  const [expandedRegimentId, setExpandedRegimentId] = useState(null);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const [workoutDetails, setWorkoutDetails] = useState({});
  const [error, setError] = useState("");
    const navigate = useNavigate();
  // Fetch all regiments
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/workouts/regiments")
      .then((res) => setRegiments(res.data.items || []))
      .catch((err) => {
        console.error("Error fetching regiments:", err);
        setError("Failed to load regiments.");
      });
  }, []);

  // Toggle to expand/collapse a regiment
  const toggleRegiment = (regimentId) => {
    setExpandedRegimentId((prev) => (prev === regimentId ? null : regimentId));
    setExpandedWorkoutId(null);
  };

  // Fetch and expand a workout
  const toggleWorkout = async (workout_id) => {
    if (expandedWorkoutId === workout_id) {
      setExpandedWorkoutId(null);
      return;
    }

    if (!workoutDetails[workout_id]) {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/workouts/${workout_id}`
        );
        setWorkoutDetails((prev) => ({
          ...prev,
          [workout_id]: res.data.item,
        }));
      } catch (err) {
        console.error("Error fetching workout:", err);
        setError("Failed to load workout details.");
      }
    }

    setExpandedWorkoutId(workout_id);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Workout Manager</h1>
        <button onClick={() => navigate('create-regiment')}>
            Create regiment
        </button>
      {error && <p className="text-red-600">{error}</p>}

      {regiments.map((regiment) => (
        <div
          key={regiment.regiment_id}
          className="bg-white shadow rounded-lg mb-4 p-4 border"
        >
          <h2
            className="text-xl font-semibold cursor-pointer text-blue-600"
            onClick={() => toggleRegiment(regiment.regiment_id)}
          >
            {regiment.name}
          </h2>

          {expandedRegimentId === regiment.regiment_id && (
            <div className="mt-3 space-y-2 ml-4">
              {regiment.workout_structure.map((day, index) => (
                <div key={index}>
                  <p
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => toggleWorkout(day.workout_id)}
                  >
                    {day.name}
                  </p>

                  {expandedWorkoutId === day.workout_id &&
                    workoutDetails[day.workout_id] && (
                      <div className="ml-4 mt-2 space-y-4">
                        {workoutDetails[day.workout_id].structure.map(
                          (exercise, i) => (
                            <div
                              key={i}
                              className="p-3 border rounded-md bg-gray-50"
                            >
                              <h3 className="font-semibold text-lg">
                                {exercise.exercise_details.name}{" "}
                                <span className="text-sm text-gray-500">
                                  ({exercise.exercise_details.muscle_group})
                                </span>
                              </h3>

                              <div className="ml-3 mt-1 text-sm">
                                {Object.entries(exercise.sets).map(
                                  ([setNumber, setDetails]) => (
                                    <div key={setNumber}>
                                      <strong>Set {setNumber}:</strong>{" "}
                                      {setDetails.reps
                                        ? `${setDetails.reps} reps`
                                        : ""}
                                      {setDetails.weight
                                        ? `, ${setDetails.weight} ${exercise.weight_unit}`
                                        : ""}
                                      {setDetails.time
                                        ? `, ${setDetails.time} ${exercise.time_unit}`
                                        : ""}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Home;
