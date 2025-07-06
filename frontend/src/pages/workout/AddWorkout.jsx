import React, { useEffect, useState } from "react";
import axios from "axios";
import ExerciseDropdown from "../../components/workout/ExerciseDropdown.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider.jsx";
import { ArrowLeft, Plus, X, Check, AlertTriangle } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const CreateWorkout = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    created_by: null,
    structure: [],
  });

  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { uid } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (uid) {
      setFormData((prev) => ({ ...prev, created_by: uid }));
    }
  }, [uid]);

  useEffect(() => {
    axios
      .get(`${API_URL}/workouts/exercises`)
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
          laps_unit: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/workouts`, {
        ...formData,
      });
      setMessage("Workout created successfully");
      setTimeout(() => {
        setFormData({ name: "", description: "", created_by: uid, structure: [] });
        setIsSubmitting(false);
        navigate("/Workout_Management");
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Submission failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white min-h-screen">
      <button
        onClick={() => navigate("/create-regiment")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Regiment
      </button>

      <h1 className="text-3xl font-bold text-[#4B9CD3] mb-8">Create Workout</h1>
      <button
        type="button"
        onClick={() => navigate("/create-exercise")}
        className="flex items-center gap-2 mb-8 px-6 py-3 bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
      >
        <Plus className="h-5 w-5" /> Create New Exercise
      </button>

      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-lg mt-2">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Important Note</p>
            <p className="text-red-600">
              The weights you enter must be the <span className="font-semibold">total weight</span> and not for a single side.
              For example, if you lift 20kg on bench press with each hand, enter 40kg as that's the total weight.
              This ensures accurate intensity calculation.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-[#4B9CD3]">Workout Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Enter workout name"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2 text-[#4B9CD3]">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Optional workout description"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#4B9CD3]">Exercises</h2>
            <button
              type="button"
              onClick={addExercise}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transform transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Plus className="h-5 w-5" /> Add Exercise
            </button>
          </div>

          {formData.structure.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No exercises added yet. Click "Add Exercise" to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {formData.structure.map((exercise, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-6 shadow-sm bg-gray-50 hover:shadow-md transition-all duration-200"
                >
                  <div className="mb-6">
                    <ExerciseDropdown
                      exercises={exercises}
                      selectedId={exercise.exercise_id}
                      onSelect={(id) => handleExerciseChange(idx, id)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-6 mb-6">
                    {exercise.units.includes("weight") && (
                      <div className="flex flex-col">
                        <label className="text-gray-700 font-medium mb-1">Weight Unit</label>
                        <select
                          value={exercise.weight_unit}
                          onChange={(e) => {
                            const updated = [...formData.structure];
                            updated[idx].weight_unit = e.target.value;
                            setFormData({ ...formData, structure: updated });
                          }}
                          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all w-32"
                        >
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    )}

                    {exercise.units.includes("time") && (
                      <div className="flex flex-col">
                        <label className="text-gray-700 font-medium mb-1">Time Unit</label>
                        <select
                          value={exercise.time_unit}
                          onChange={(e) => {
                            const updated = [...formData.structure];
                            updated[idx].time_unit = e.target.value;
                            setFormData({ ...formData, structure: updated });
                          }}
                          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all w-32"
                        >
                          <option value="seconds">seconds</option>
                          <option value="minutes">minutes</option>
                        </select>
                      </div>
                    )}

                    {exercise.units.includes("laps") && (
                      <div className="flex flex-col">
                        <label className="text-gray-700 font-medium mb-1">Lap Unit</label>
                        <input
                          type="text"
                          placeholder="e.g. 400m or 1km"
                          value={exercise.laps_unit}
                          onChange={(e) => {
                            const updated = [...formData.structure];
                            updated[idx].laps_unit = e.target.value;
                            setFormData({ ...formData, structure: updated });
                          }}
                          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all w-48"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-[#4B9CD3]">Sets</h3>
                      <button
                        type="button"
                        onClick={() => addSet(idx)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Add Set
                      </button>
                    </div>

                    {Object.entries(exercise.sets).length === 0 ? (
                      <p className="text-gray-400 italic">No sets added yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(exercise.sets).map(([key, set]) => (
                          <div
                            key={key}
                            className="flex flex-wrap gap-4 items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                          >
                            <span className="font-semibold text-gray-700 min-w-[60px]">Set {key}</span>

                            {exercise.units.includes("reps") && (
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">Reps</label>
                                <input
                                  type="number"
                                  placeholder="Reps"
                                  value={set.reps}
                                  onChange={(e) => handleSetChange(idx, key, "reps", e.target.value)}
                                  className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                />
                              </div>
                            )}

                            {exercise.units.includes("weight") && (
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">Weight</label>
                                <input
                                  type="number"
                                  placeholder="Weight"
                                  value={set.weight}
                                  onChange={(e) => handleSetChange(idx, key, "weight", e.target.value)}
                                  className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                />
                              </div>
                            )}

                            {exercise.units.includes("time") && (
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">Time</label>
                                <input
                                  type="number"
                                  placeholder="Time"
                                  value={set.time}
                                  onChange={(e) => handleSetChange(idx, key, "time", e.target.value)}
                                  className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                />
                              </div>
                            )}

                            {exercise.units.includes("laps") && (
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">Laps</label>
                                <input
                                  type="number"
                                  placeholder="Laps"
                                  value={set.laps}
                                  onChange={(e) => handleSetChange(idx, key, "laps", e.target.value)}
                                  className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                />
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => removeSet(idx, key)}
                              className="ml-auto text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                            >
                              <X className="h-4 w-4" /> Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExercise(idx)}
                    className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="h-5 w-5" /> Remove Exercise
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 px-6 rounded-lg transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2 ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#4B9CD3] to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white'
              }`}
          >
            {isSubmitting ? (
              <div className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check className="h-5 w-5" />
            )}
            Create Workout
          </button>
        </div>

        {message && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fadeIn">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateWorkout;