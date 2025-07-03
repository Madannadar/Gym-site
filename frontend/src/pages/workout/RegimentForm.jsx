// src/pages/RegimentForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthProvider";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const RegimentForm = () => {
  const { uid } = useAuth();
  const navigate = useNavigate();
  const { regimentId } = useParams(); // will be undefined for creation
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

  useEffect(() => {
    if (uid) {
      setFormData((prev) => ({ ...prev, created_by: uid }));
    }
  }, [uid]);

  useEffect(() => {
    // Always fetch workouts
    const fetchWorkouts = async () => {
      try {
        const res = await axios.get(`${API_URL}/workouts`);
        setAvailableWorkouts(res.data.items || []);
      } catch (err) {
        console.error("Error loading workouts", err);
        setError("Failed to load workouts");
      }
    };

    // Only fetch regiment data in update mode
    const fetchRegiment = async () => {
      try {
        const res = await axios.get(`${API_URL}/workouts/regiments/${regimentId}`);
        setFormData((prev) => ({
          ...prev,
          ...res.data.item,
          // Ensure 'workout_id's are strings to match <select> values
          workout_structure: res.data.item.workout_structure.map((day) => ({
            ...day,
            workout_id: String(day.workout_id),
          })),
        }));
      } catch (err) {
        console.error("Error fetching regiment", err);
        setError("Failed to fetch regiment details");
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

    const { name, description, workout_structure, created_by } = formData;

    if (workout_structure.length === 0) {
      setError("Please add at least one workout day.");
      return;
    }

    const workoutIds = workout_structure.map((day) => Number(day.workout_id));
    const duplicates = workoutIds.filter((id, idx) => id && workoutIds.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      setError("Each workout must be unique. Please remove duplicates.");
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
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || "Something went wrong.";
      setError(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mt-6 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-[#4B9CD3]">
        {isUpdateMode ? "Update" : "Create"} Regiment
      </h2>

      {!isUpdateMode && (
        <button
          type="button"
          className="bg-[#4B9CD3] text-white py-2 px-4 rounded w-full mb-6 hover:bg-blue-500"
          onClick={() => navigate("/create-workout")}
        >
          ➕ Create New Workout
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1 text-[#4B9CD3]">Regiment Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-[#4B9CD3]">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-[#4B9CD3]">Workout Structure</label>
          <button
            type="button"
            onClick={addDay}
            className="text-[#4B9CD3] text-sm mt-2 hover:underline"
          >
            ➕ Add Day
          </button>
          {formData.workout_structure.map((day, idx) => (
            <div key={idx} className="bg-gray-100 p-3 rounded mb-3 flex flex-col md:flex-row gap-3 items-center border">
              <input
                type="text"
                placeholder="Day Name"
                value={day.name}
                onChange={(e) => handleDayChange(idx, "name", e.target.value)}
                className="border p-2 rounded w-full md:w-1/3"
                required
              />
              <select
                value={day.workout_id}
                onChange={(e) => handleDayChange(idx, "workout_id", e.target.value)}
                className="border p-2 rounded w-full md:w-1/2"
                required
              >
                <option value="">-- Select Workout --</option>
                {availableWorkouts.map((workout) => (
                  <option key={workout.workout_id} value={workout.workout_id}>
                    {workout.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeDay(idx)}
                className="text-red-500 font-semibold"
              >
                ✖ Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-[#4B9CD3] text-white py-2 px-4 rounded w-full hover:bg-blue-500"
        >
          ✅ {isUpdateMode ? "Update" : "Create"} Regiment
        </button>

        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default RegimentForm;
