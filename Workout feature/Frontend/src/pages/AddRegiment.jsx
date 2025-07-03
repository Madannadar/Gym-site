// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const CreateRegiment = () => {
//     const [formData, setFormData] = useState({
//         created_by: 1,
//         name: "",
//         description: "",
//         workout_structure: [],
//     });

//     const [availableWorkouts, setAvailableWorkouts] = useState([]);
//     const [message, setMessage] = useState("");
//     const [error, setError] = useState("");
//     const navigate = useNavigate();

//     useEffect(() => {
//         axios
//             .get(`${VITE_BACKEND_URL}/workouts`)
//             .then((res) => setAvailableWorkouts(res.data.items || []))
//             .catch((err) => {
//                 console.error("Error loading workouts", err);
//                 setError("Failed to load workouts");
//             });
//     }, []);

//     const addDay = () => {
//         const dayNumber = formData.workout_structure.length + 1;
//         const newDay = { name: `Day ${dayNumber}`, workout_id: "" };
//         setFormData((prev) => ({
//             ...prev,
//             workout_structure: [...prev.workout_structure, newDay],
//         }));
//     };

//     const handleDayChange = (index, field, value) => {
//         const updated = [...formData.workout_structure];
//         updated[index][field] = value;
//         setFormData({ ...formData, workout_structure: updated });
//     };

//     const removeDay = (index) => {
//         const updated = [...formData.workout_structure];
//         updated.splice(index, 1);
//         setFormData({
//             ...formData,
//             workout_structure: updated.map((day, i) => ({
//                 ...day,
//                 name: `Day ${i + 1}`,
//             })),
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage("");
//         setError("");

//         const { name, description, workout_structure } = formData;

//         if (workout_structure.length === 0) {
//             setError("Please add at least one workout day.");
//             return;
//         }

//         const workoutIds = workout_structure.map((day) => Number(day.workout_id));
//         const duplicates = workoutIds.filter(
//             (id, idx) => id && workoutIds.indexOf(id) !== idx
//         );

//         if (duplicates.length > 0) {
//             setError("Each workout must be unique. Please remove duplicates.");
//             return;
//         }

//         try {
//             const res = await axios.post(`${VITE_BACKEND_URL}/workouts/regiments`, {
//                 created_by: 1,
//                 name,
//                 description,
//                 workout_structure: workout_structure.map((day) => ({
//                     name: day.name,
//                     workout_id: Number(day.workout_id),
//                 })),
//             });

//             setMessage("Regiment created successfully!");

//             // Navigate to home after short delay
//             setTimeout(() => {
//                 navigate('/');
//             }, 1000); // optional delay to show success message before redirect

//         } catch (err) {
//             const msg = err?.response?.data?.error?.message || "Failed to create regiment.";
//             setError(msg);
//         }
//     };


//     return (
//         <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mt-6">
//             <h2 className="text-2xl font-bold mb-4">Create Workout Regiment</h2>
//             <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded w-full" onClick={() => navigate('/create-workout')}>
//                 Create Workout
//             </button>

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                     <label className="block font-medium mb-1">Regiment Name</label>
//                     <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         className="w-full border p-2 rounded"
//                         required
//                     />
//                 </div>

//                 <div>
//                     <label className="block font-medium mb-1">Description</label>
//                     <textarea
//                         rows={3}
//                         value={formData.description}
//                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                         className="w-full border p-2 rounded"
//                     />
//                 </div>

//                 <div>
//                     <label className="block font-medium mb-1">Workout Structure</label>
//                     {formData.workout_structure.map((day, idx) => (
//                         <div
//                             key={idx}
//                             className="bg-gray-100 p-3 rounded mb-3 flex flex-col md:flex-row gap-3 items-center"
//                         >
//                             <input
//                                 type="text"
//                                 placeholder="Day Name"
//                                 value={day.name}
//                                 onChange={(e) => handleDayChange(idx, "name", e.target.value)}
//                                 className="border p-2 rounded w-full md:w-1/3"
//                                 required
//                             />
//                             <select
//                                 value={day.workout_id}
//                                 onChange={(e) => handleDayChange(idx, "workout_id", e.target.value)}
//                                 className="border p-2 rounded w-full md:w-1/2"
//                                 required
//                             >
//                                 <option value="">-- Select Workout --</option>
//                                 {availableWorkouts.map((workout) => (
//                                     <option key={workout.workout_id} value={workout.workout_id}>
//                                         {workout.name}
//                                     </option>
//                                 ))}
//                             </select>
//                             <button
//                                 type="button"
//                                 onClick={() => removeDay(idx)}
//                                 className="text-red-500"
//                             >
//                                 Remove
//                             </button>
//                         </div>
//                     ))}
//                     <button
//                         type="button"
//                         onClick={addDay}
//                         className="text-blue-600 text-sm mt-2"
//                     >
//                         + Add Day
//                     </button>
//                 </div>

//                 <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded w-full">
//                     Create Regiment
//                 </button>
//                 {message && <p className="text-green-600 text-center">{message}</p>}
//                 {error && <p className="text-red-600 text-center">{error}</p>}
//             </form>

//             {/* {formData.workout_structure.length > 0 && (
//                 <div className="mt-8 bg-gray-50 border rounded p-4">
//                     <h3 className="text-lg font-semibold mb-2">Workout Structure Preview</h3>
//                     <ul className="space-y-2">
//                         {formData.workout_structure.map((day, idx) => {
//                             const workout = availableWorkouts.find(
//                                 (w) => w.workout_id === Number(day.workout_id)
//                             );
//                             return (
//                                 <li key={idx} className="border p-2 rounded bg-white shadow-sm">
//                                     <strong>{day.name}</strong>: {workout ? workout.name : "Unknown Workout"}
//                                 </li>
//                             );
//                         })}
//                     </ul>
//                 </div>
//             )} */}
//         </div>
//     );
// };

// export default CreateRegiment;
