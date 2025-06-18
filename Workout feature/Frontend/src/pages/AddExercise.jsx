import React from "react";
import ExerciseForm from "../components/ExerciseForm";

const CreateExercise = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Exercise</h2>
        <ExerciseForm />
      </div>
    </div>
  );
};

export default CreateExercise;
