import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const unitOptions = ["reps", "time", "weight", "laps"];

const CreateExercise = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    muscle_group: "",
    units: [],
    created_by: null,
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uid } = useAuth();

  useEffect(() => {
    if (uid) {
      setFormData((prev) => ({ ...prev, created_by: uid }));
    }
  }, [uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleUnit = (unit) => {
    setFormData((prev) => {
      const isSelected = prev.units.includes(unit);
      const updatedUnits = isSelected
        ? prev.units.filter((u) => u !== unit)
        : [...prev.units, unit];
      return { ...prev, units: updatedUnits };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    if (formData.units.length === 0) {
      setError("Please select at least one unit.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/workouts/exercises`,
        formData
      );

      setMessage("Exercise created successfully!");
      setTimeout(() => {
        setFormData({
          name: "",
          description: "",
          muscle_group: "",
          units: [],
          created_by: uid,
        });
        navigate("/Workout_Management");
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || "Something went wrong";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white min-h-screen">
      <button 
        onClick={() => navigate("/Workout_Management")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Workouts
      </button>

      <h1 className="text-3xl font-bold text-[#4B9CD3] mb-8">Create Exercise</h1>

      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-700">Important Note</p>
            <p className="text-yellow-600">
              Select all units that apply to this exercise. For example:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Bench press: reps and weight</li>
                <li>Plank: time</li>
                <li>Running: laps (with distance unit)</li>
              </ul>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-[#4B9CD3]">Exercise Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Bench Press, Squat, Plank"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2 text-[#4B9CD3]">Description</label>
            <input
              type="text"
              name="description"
              placeholder="Brief description of the exercise"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2 text-[#4B9CD3]">Muscle Group</label>
            <input
              type="text"
              name="muscle_group"
              placeholder="e.g., Chest, Legs, Core"
              value={formData.muscle_group}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-[#4B9CD3]">Select Units</label>
            <div className="flex flex-wrap gap-3">
              {unitOptions.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => toggleUnit(unit)}
                  className={`px-4 py-2 rounded-full border font-semibold transition-all duration-200 ${
                    formData.units.includes(unit)
                      ? "bg-[#4B9CD3] text-white border-[#4B9CD3] transform hover:scale-105 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-medium text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#4B9CD3] to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <div className="inline-block h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Check className="h-6 w-6" />
          )}
          Create Exercise
        </button>

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

export default CreateExercise;