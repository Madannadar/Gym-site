// pages/CreateWorkout.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ExerciseDropdown from "../components/ExerciseDropdown";

const CreateWorkout = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    score: "",
    created_by: 1,
    structure: [],
  });

  const [exercises, setExercises] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/workouts/exercises")
      .then((res) => setExercises(res.data.items))
      .catch((err) => {
        console.error("Failed to fetch exercises", err);
        setError("Failed to load exercises");
      });
  }, []);

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      structure: [
        ...prev.structure,
        {
          exercise_id: "",
          weight_unit: "",
          time_unit: "",
          units: [],
          sets: {},
        },
      ],
    }));
  };

  const removeExercise = (index) => {
    const updated = [...formData.structure];
    updated.splice(index, 1);
    setFormData({ ...formData, structure: updated });
  };

  const handleExerciseChange = (index, selectedId) => {
    const selectedExercise = exercises.find((ex) => ex.exercise_id == selectedId);
    if (!selectedExercise) return;

    const updated = [...formData.structure];
    updated[index].exercise_id = selectedExercise.exercise_id;
    updated[index].units = selectedExercise.units;
    updated[index].weight_unit = selectedExercise.units.includes("weight") ? "kg" : "";
    updated[index].time_unit = selectedExercise.units.includes("time") ? "seconds" : "";
    setFormData({ ...formData, structure: updated });
  };

  const addSet = (exIndex) => {
    const structure = [...formData.structure];
    const sets = structure[exIndex].sets || {};
    const newKey = Object.keys(sets).length + 1;
    sets[newKey] = { reps: "", weight: "", time: "" };
    structure[exIndex].sets = sets;
    setFormData({ ...formData, structure });
  };

  const handleSetChange = (exIndex, setKey, field, value) => {
    const structure = [...formData.structure];
    structure[exIndex].sets[setKey][field] = value;
    setFormData({ ...formData, structure });
  };

  const removeSet = (exIndex, setKey) => {
    const structure = [...formData.structure];
    delete structure[exIndex].sets[setKey];
    setFormData({ ...formData, structure });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/api/workouts", {
        ...formData,
        score: Number(formData.score),
        structure: formData.structure.map(({ units, ...rest }) => rest),
      });

      setMessage("Workout created successfully");
      setFormData({ name: "", description: "", score: "", created_by: 1, structure: [] });
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Submission failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-6">
      <h2 className="text-xl font-bold mb-4">Create New Workout</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label>Score</label>
          <input
            type="number"
            name="score"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label>Exercises</label>
          {formData.structure.map((exercise, idx) => (
            <div key={idx} className="border p-4 rounded mb-4">
              <ExerciseDropdown
                exercises={exercises}
                selectedId={exercise.exercise_id}
                onSelect={(id) => handleExerciseChange(idx, id)}
              />

              <div className="flex gap-4">
                {exercise.units.includes("weight") && (
                  <div>
                    <label>Weight Unit</label>
                    <input
                      type="text"
                      value={exercise.weight_unit}
                      readOnly
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                {exercise.units.includes("time") && (
                  <div>
                    <label>Time Unit</label>
                    <input
                      type="text"
                      value={exercise.time_unit}
                      readOnly
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>

              <div className="mt-2">
                <label>Sets</label>
                {Object.entries(exercise.sets).map(([key, set]) => (
                  <div key={key} className="flex gap-2 items-center mt-2">
                    <span>Set {key}</span>
                    {exercise.units.includes("reps") && (
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) => handleSetChange(idx, key, "reps", e.target.value)}
                        className="w-16 border p-1 rounded"
                      />
                    )}
                    {exercise.units.includes("weight") && (
                      <input
                        type="number"
                        placeholder="Weight"
                        value={set.weight}
                        onChange={(e) => handleSetChange(idx, key, "weight", e.target.value)}
                        className="w-16 border p-1 rounded"
                      />
                    )}
                    {exercise.units.includes("time") && (
                      <input
                        type="number"
                        placeholder="Time"
                        value={set.time}
                        onChange={(e) => handleSetChange(idx, key, "time", e.target.value)}
                        className="w-16 border p-1 rounded"
                      />
                    )}
                    <button type="button" onClick={() => removeSet(idx, key)} className="text-red-500">Remove</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSet(idx)}
                  className="mt-2 text-sm text-green-600"
                >
                  + Add Set
                </button>
              </div>
              <button type="button" onClick={() => removeExercise(idx)} className="text-red-600 mt-2">Remove Exercise</button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExercise}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            + Add Exercise
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white w-full py-3 rounded"
        >
          Create Workout
        </button>

        {message && <p className="text-green-600 text-center mt-3">{message}</p>}
        {error && <p className="text-red-600 text-center mt-3">{error}</p>}
      </form>
    </div>
  );
};

export default CreateWorkout;
