import React from "react";
import WorkoutForm from "../components/WorkoutForm";

const CreateWorkout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Workout</h2>
        <WorkoutForm />
      </div>
    </div>
  );
};

export default CreateWorkout;
