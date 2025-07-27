import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import { ArrowLeft, Plus, X, Check } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const RegimentForm = () => {
  const { uid } = useAuth();
  const navigate = useNavigate();
  const { regimentId } = useParams();
  const location = useLocation();

  const isUpdateMode = Boolean(regimentId);

  const [formData, setFormData] = useState({
    created_by: null,
    name: "",
    description: "",
    workout_structure: [],
  });

  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (uid) {
      setFormData((prev) => ({ ...prev, created_by: uid }));
    }
  }, [uid]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await axios.get(`${API_URL}/workouts`);
        setAvailableWorkouts(res.data.items || []);
      } catch (err) {
        console.error("Error loading workouts", err);
        setError("Failed to load workouts");
      }
    };

    const fetchRegiment = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/workouts/regiments/${regimentId}`);
        setFormData((prev) => ({
          ...prev,
          ...res.data.item,
          workout_structure: res.data.item.workout_structure.map((day) => ({
            ...day,
            workout_id: String(day.workout_id),
          })),
        }));
      } catch (err) {
        console.error("Error fetching regiment", err);
        setError("Failed to fetch regiment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();

    if (isUpdateMode && regimentId) {
      fetchRegiment();
    }
  }, [isUpdateMode, regimentId]);

  const addDay = () => {
    const dayNumber = formData.workout_structure.length + 1;
    const newDay = { name: `Day ${dayNumber}`, workout_id: "" };
    setFormData((prev) => ({
      ...prev,
      workout_structure: [...prev.workout_structure, newDay],
    }));
  };

  const handleDayChange = (index, field, value) => {
    const updated = [...formData.workout_structure];
    updated[index][field] = value;
    setFormData({ ...formData, workout_structure: updated });
  };

  const removeDay = (index) => {
    const updated = [...formData.workout_structure];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      workout_structure: updated.map((day, i) => ({
        ...day,
        name: `Day ${i + 1}`,
      })),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    const { name, description, workout_structure, created_by } = formData;

    if (workout_structure.length === 0) {
      setError("Please add at least one workout day.");
      setIsLoading(false);
      return;
    }

    const workoutIds = workout_structure.map((day) => Number(day.workout_id));
    const duplicates = workoutIds.filter((id, idx) => id && workoutIds.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      setError("Each workout must be unique. Please remove duplicates.");
      setIsLoading(false);
      return;
    }

    const payload = {
      name,
      description,
      ...(isUpdateMode ? {} : { created_by }),
      workout_structure: workout_structure.map((day) => ({
        name: day.name,
        workout_id: Number(day.workout_id),
      })),
    };

    try {
      if (isUpdateMode && regimentId) {
        await axios.put(`${API_URL}/workouts/regiments/${regimentId}`, payload);
        setMessage("Regiment updated successfully!");
      } else {
        await axios.post(`${API_URL}/workouts/regiments`, payload);
        setMessage("Regiment created successfully!");
      }
      setTimeout(() => navigate("/Workout_Management"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || "Something went wrong.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isUpdateMode) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white min-h-screen">
      <button 
        onClick={() => navigate('/Workout_Management')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Workouts Management
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#4B9CD3]">
          {isUpdateMode ? "Update Regiment" : "Create New Regiment"}
        </h1>
      </div>

      {!isUpdateMode && (
        <button
          type="button"
          onClick={() => navigate("/create-workout")}
          className="flex items-center gap-2 mb-8 px-6 py-3 bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
        >
          <Plus className="h-5 w-5" /> Create New Workout
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="mb-6">
            <label className="block font-medium mb-2 text-[#4B9CD3]">Regiment Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              required
              placeholder="e.g., Beginner Strength Program"
            />
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-2 text-[#4B9CD3]">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Describe the purpose and goals of this regiment"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#4B9CD3]">Workout Structure</h3>
            <button
              type="button"
              onClick={addDay}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transform transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Plus className="h-4 w-4" /> Add Day
            </button>
          </div>

          {formData.workout_structure.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No workout days added yet. Click "Add Day" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.workout_structure.map((day, idx) => (
                <div 
                  key={idx} 
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#4B9CD3] transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day Name</label>
                      <input
                        type="text"
                        placeholder="Day Name"
                        value={day.name}
                        onChange={(e) => handleDayChange(idx, "name", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div className="w-full md:w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Workout</label>
                      <select
                        value={day.workout_id}
                        onChange={(e) => handleDayChange(idx, "workout_id", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">-- Select Workout --</option>
                        {availableWorkouts.map((workout) => (
                          <option key={workout.workout_id} value={workout.workout_id}>
                            {workout.name} {workout.score ? `(Score: ${workout.score})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDay(idx)}
                      className="flex items-center gap-1 px-3 py-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-5 w-5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#4B9CD3] to-blue-500 hover:from-blue-500 hover:to-blue-600 transform hover:scale-105'
          } text-white`}
        >
          {isLoading ? (
            <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Check className="h-5 w-5" />
          )}
          {isUpdateMode ? "Update Regiment" : "Create Regiment"}
        </button>

        {message && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default RegimentForm;