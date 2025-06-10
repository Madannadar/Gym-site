import React, { useState, useEffect } from "react";
import axios from "axios";

const RecordWorkoutForm = () => {
  const [formData, setFormData] = useState({
    user_id: 1,
    regiment_id: "",
    regiment_day_index: 0,
    log_date: "",
    planned_workout_id: "",
    actual_workout: [
      {
        exercise_id: "",
        sets: {
          set1: { reps: "", weight: "", weight_unit: "kg" },
          set2: { reps: "", weight: "", weight_unit: "kg" },
        },
      },
    ],
    score: "",
  });

  const [regiments, setRegiments] = useState([]);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regimentRes = await axios.get("http://localhost:3000/api/workouts/regiments");
        const exerciseRes = await axios.get("http://localhost:3000/api/workouts/exercises");

        setRegiments(regimentRes.data.items || []);
        setExercises(exerciseRes.data.items || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Clean and convert form data before sending to backend
  const cleanFormData = () => {
    return {
      ...formData,
      regiment_id: formData.regiment_id ? Number(formData.regiment_id) : null,
      planned_workout_id: formData.planned_workout_id ? Number(formData.planned_workout_id) : null,
      regiment_day_index: formData.regiment_day_index ? Number(formData.regiment_day_index) : 0,
      score: formData.score ? Number(formData.score) : 0,
      log_date: formData.log_date || null,
      actual_workout: formData.actual_workout.map((ex) => ({
        exercise_id: ex.exercise_id ? Number(ex.exercise_id) : null,
        sets: Object.fromEntries(
          Object.entries(ex.sets).map(([key, set]) => [
            key,
            {
              reps: set.reps ? Number(set.reps) : null,
              weight: set.weight ? Number(set.weight) : null,
              weight_unit: set.weight_unit || "kg",
            },
          ])
        ),
      })),
    };
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleActualWorkoutChange = (index, field, value) => {
    const updated = [...formData.actual_workout];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, actual_workout: updated }));
  };

  const handleSetChange = (index, setKey, field, value) => {
    const updated = [...formData.actual_workout];
    updated[index].sets[setKey][field] = value;
    setFormData((prev) => ({ ...prev, actual_workout: updated }));
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      actual_workout: [
        ...prev.actual_workout,
        {
          exercise_id: "",
          sets: {
            set1: { reps: "", weight: "", weight_unit: "kg" },
            set2: { reps: "", weight: "", weight_unit: "kg" },
          },
        },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation (optional)
    if (!formData.regiment_id) {
      alert("Please select a regiment.");
      return;
    }
    if (!formData.log_date) {
      alert("Please select a date.");
      return;
    }
    if (!formData.planned_workout_id) {
      alert("Please enter planned workout ID.");
      return;
    }

    try {
      const payload = cleanFormData();
      // console.log("Payload to send:", payload);
      await axios.post("http://localhost:3000/api/workouts/logs", payload);
      alert("Workout log recorded successfully");
      // Optionally reset form here
    } catch (err) {
      console.error("❌ Submission failed:", err);
      alert("Failed to record workout log");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-4 bg-white rounded shadow space-y-4"
    >
      <h2 className="text-xl font-bold mb-2">Record Workout Log</h2>

      <div className="grid gap-2">
        <select
          value={formData.regiment_id}
          onChange={(e) => handleChange("regiment_id", e.target.value)}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Regiment</option>
          {regiments.map((reg) => (
            <option key={reg.regiment_id} value={reg.regiment_id}>
              {reg.name || `Regiment ${reg.regiment_id}`}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={formData.log_date}
          onChange={(e) => handleChange("log_date", e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="number"
          placeholder="Planned Workout ID"
          value={formData.planned_workout_id}
          onChange={(e) => handleChange("planned_workout_id", e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="number"
          placeholder="Day Index"
          value={formData.regiment_day_index}
          onChange={(e) => handleChange("regiment_day_index", e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Score"
          value={formData.score}
          onChange={(e) => handleChange("score", e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="space-y-6">
        {formData.actual_workout.map((exercise, idx) => (
          <div key={idx} className="border p-3 rounded">
            <select
              value={exercise.exercise_id}
              onChange={(e) => handleActualWorkoutChange(idx, "exercise_id", e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Exercise</option>
              {exercises.map((ex) => (
                <option key={ex.exercise_id} value={ex.exercise_id}>
                  {ex.name || `Exercise ${ex.exercise_id}`}
                </option>
              ))}
            </select>
            {Object.keys(exercise.sets).map((setKey) => (
              <div key={setKey} className="mt-2">
                <h4 className="text-sm font-semibold">{setKey.toUpperCase()}</h4>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.sets[setKey].reps || ""}
                    onChange={(e) =>
                      handleSetChange(idx, setKey, "reps", e.target.value)
                    }
                    className="border p-1 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Weight"
                    value={exercise.sets[setKey].weight || ""}
                    onChange={(e) =>
                      handleSetChange(idx, setKey, "weight", e.target.value)
                    }
                    className="border p-1 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={exercise.sets[setKey].weight_unit || ""}
                    onChange={(e) =>
                      handleSetChange(idx, setKey, "weight_unit", e.target.value)
                    }
                    className="border p-1 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}

        <button
          type="button"
          onClick={addExercise}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          + Add Exercise
        </button>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded mt-4 w-full"
      >
        Submit Log
      </button>
    </form>
  );
};

export default RecordWorkoutForm;
