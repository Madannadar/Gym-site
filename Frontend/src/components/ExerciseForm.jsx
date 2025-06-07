import React, { useState } from 'react';
import axios from 'axios';

const ExerciseForm = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    muscle_group: '',
    units: [],
    created_by: '',
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const unitsOptions = ['reps', 'weight', 'time'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const units = checked
        ? [...prev.units, value]
        : prev.units.filter((u) => u !== value);
      return { ...prev, units };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/workouts/exercises', form);
      setResult(res.data.item);
      setError('');
    } catch (err) {
      console.error('❌ Failed to submit exercise:', err);
      setError('Failed to record exercise');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">Add Exercise</h2>

      <input
        type="text"
        name="name"
        placeholder="Exercise Name"
        required
        value={form.name}
        onChange={handleChange}
        className="w-full border border-gray-300 px-4 py-2 rounded"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full border border-gray-300 px-4 py-2 rounded"
      />
      <input
        type="text"
        name="muscle_group"
        placeholder="Muscle Group"
        value={form.muscle_group}
        onChange={handleChange}
        className="w-full border border-gray-300 px-4 py-2 rounded"
      />
      <input
        type="number"
        name="created_by"
        placeholder="Created By (user_id)"
        value={form.created_by}
        onChange={handleChange}
        className="w-full border border-gray-300 px-4 py-2 rounded"
      />

      <div className="space-y-2">
        <label className="font-semibold">Units:</label>
        <div className="flex gap-4">
          {unitsOptions.map((unit) => (
            <label key={unit} className="inline-flex items-center">
              <input
                type="checkbox"
                value={unit}
                checked={form.units.includes(unit)}
                onChange={handleCheckbox}
                className="mr-2"
              />
              {unit}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
      >
        Add Exercise
      </button>

      {result && (
        <div className="bg-green-100 p-4 rounded mt-4 text-sm">
          <h3 className="font-semibold mb-2">✅ Exercise Recorded</h3>
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default ExerciseForm;
