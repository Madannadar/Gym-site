import React, { useState } from "react";
import axios from "axios";

const unitOptions = ["reps", "time", "weight", "laps"];

const ExerciseForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    muscle_group: "",
    units: [],
    created_by: 1,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  if (formData.units.length === 0) {
    setError("Please select at least one unit.");
    return;
  }

  try {
    const response = await axios.post(
      `${VITE_BACKEND_URL}/workouts/exercises`,
      formData
    );

    setMessage(response.data.message);
    setFormData({
      name: "",
      description: "",
      muscle_group: "",
      units: [],
      created_by: 1,
    });
  } catch (err) {
    const msg = err?.response?.data?.error?.message || "Something went wrong";
    setError(msg);
  }
};


  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Create New Exercise</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Exercise Name</label>
          <input
            type="text"
            name="name"
            placeholder="Push-up"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Description</label>
          <input
            type="text"
            name="description"
            placeholder="Upper body strength"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Muscle Group</label>
          <input
            type="text"
            name="muscle_group"
            placeholder="Chest, Triceps"
            value={formData.muscle_group}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Select Units</label>
          <div className="flex flex-wrap gap-3">
            {unitOptions.map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => toggleUnit(unit)}
                className={`px-4 py-2 rounded-full border ${
                  formData.units.includes(unit)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                } transition duration-200`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200"
        >
          Create Exercise
        </button>

        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default ExerciseForm;
