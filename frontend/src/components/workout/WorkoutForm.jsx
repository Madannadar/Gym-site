import React, { useEffect, useState } from "react";
import axios from "axios";
import ExerciseDropdown from "../../components/workout/ExerciseDropdown.jsx"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider.jsx";

const CreateWorkout = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    score: "",
    created_by: 1,
    structure: [],
  });

  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { uid } = useAuth();

  useEffect(() => {
    if (uid) {
      setFormData((prev) => ({ ...prev, created_by: uid }));
    }
  }, [uid]);

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
    sets[newKey] = { reps: "", weight: "", time: "", laps: "" };
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

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-10 font-sans">
      <h2 className="text-3xl font-extrabold mb-8 text-[#4B9CD3] text-center">Create New Workout</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMessage("");
          setError("");
          try {
            const response = await axios.post("http://localhost:3000/api/workouts", {
              ...formData,
              score: Number(formData.score),
              structure: formData.structure,
            });
            setMessage("Workout created successfully");
            setFormData({ name: "", description: "", score: "", created_by: 1, structure: [] });
          } catch (err) {
            setError(err?.response?.data?.error?.message || "Submission failed");
          }
        }}
        className="space-y-8"
      >
        <div>
          <label className="block font-semibold mb-2 text-[#4B9CD3]">Workout Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
            placeholder="Enter workout name"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2 text-[#4B9CD3]">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
            placeholder="Optional workout description"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2 text-[#4B9CD3]">Score</label>
          <input
            type="number"
            name="score"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
            placeholder="Enter workout score"
          />
        </div>

        <div>
          <label className="block font-semibold mb-4 text-[#4B9CD3]">Exercises</label>
          {formData.structure.map((exercise, idx) => (
            <div
              key={idx}
              className="border border-gray-300 rounded-lg p-6 mb-6 shadow-md bg-gray-50"
            >
              <ExerciseDropdown
                exercises={exercises}
                selectedId={exercise.exercise_id}
                onSelect={(id) => handleExerciseChange(idx, id)}
              />

              <div className="flex flex-wrap gap-6 mt-5">
                {exercise.units.includes("weight") && (
                  <div className="flex flex-col w-32">
                    <label className="text-gray-700 font-medium mb-1">Weight Unit</label>
                    <select
                      value={exercise.weight_unit}
                      onChange={(e) => {
                        const updated = [...formData.structure];
                        updated[idx].weight_unit = e.target.value;
                        setFormData({ ...formData, structure: updated });
                      }}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                )}

                {exercise.units.includes("time") && (
                  <div className="flex flex-col w-32">
                    <label className="text-gray-700 font-medium mb-1">Time Unit</label>
                    <select
                      value={exercise.time_unit}
                      onChange={(e) => {
                        const updated = [...formData.structure];
                        updated[idx].time_unit = e.target.value;
                        setFormData({ ...formData, structure: updated });
                      }}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
                    >
                      <option value="seconds">seconds</option>
                      <option value="minutes">minutes</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="block font-semibold mb-3 text-[#4B9CD3]">Sets</label>
                {Object.entries(exercise.sets).length === 0 && (
                  <p className="text-gray-400 italic">No sets added yet.</p>
                )}
                {Object.entries(exercise.sets).map(([key, set]) => (
                  <div
                    key={key}
                    className="flex flex-wrap gap-4 items-center mb-3 bg-white p-3 rounded-lg border border-gray-300"
                  >
                    <span className="font-semibold text-gray-700 min-w-[60px]">Set {key}</span>

                    {exercise.units.includes("reps") && (
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) => handleSetChange(idx, key, "reps", e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
                      />
                    )}

                    {exercise.units.includes("weight") && (
                      <input
                        type="number"
                        placeholder="Weight"
                        value={set.weight}
                        onChange={(e) => handleSetChange(idx, key, "weight", e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
                      />
                    )}

                    {exercise.units.includes("time") && (
                      <input
                        type="number"
                        placeholder="Time"
                        value={set.time}
                        onChange={(e) => handleSetChange(idx, key, "time", e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
                      />
                    )}

                    {exercise.units.includes("laps") && (
                      <input
                        type="number"
                        placeholder="Laps"
                        value={set.laps}
                        onChange={(e) => handleSetChange(idx, key, "laps", e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4B9CD3] focus:outline-none"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => removeSet(idx, key)}
                      className="ml-auto text-red-600 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSet(idx)}
                  className="mt-2 text-[#4B9CD3] font-semibold hover:underline"
                >
                  + Add Set
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeExercise(idx)}
                className="mt-5 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold"
              >
                Remove Exercise
              </button>
            </div>
          ))}

          <div className="flex gap-4 flex-wrap">
            <button
              type="button"
              onClick={addExercise}
              className="flex-1 bg-[#4B9CD3] text-white py-3 rounded-lg font-semibold"
            >
              + Add Exercise
            </button>
            <button
              type="button"
              onClick={() => navigate("/create-exercise")}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold"
            >
              + Create Exercise
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#4B9CD3] text-white py-4 rounded-xl font-bold text-lg"
        >
          ✅ Create Workout
        </button>

        {message && <p className="text-green-600 text-center font-semibold mt-4">{message}</p>}
        {error && <p className="text-red-600 text-center font-semibold mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default CreateWorkout;
