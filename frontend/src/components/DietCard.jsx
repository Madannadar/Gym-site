import { useState } from "react";

const DietCard = ({
  name,
  description,
  calories,
  meals,
  difficulty,
  protein,
  carbs,
  fats,
  onFollow,
  isFollowed,
}) => {
  return (
    <div
      className={`shadow-lg rounded-xl w-full overflow-hidden hover:shadow-xl transition-all duration-200 ease-in-out border border-gray-200 ${
        isFollowed ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{name}</h2>
          {/* Removed veg/non-veg span */}
        </div>
        <p className="text-gray-600 text-sm py-2">{description}</p>
        <div className="flex justify-between text-gray-700 text-sm mt-3 text-center">
          <div className="flex-1">
            <p className="font-bold text-gray-900">Calories</p>
            <p>{calories}</p>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Meals</p>
            <p>{meals}</p>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Difficulty</p>
            <p>{difficulty}</p>
          </div>
        </div>

        <div className="mt-3 text-gray-700 text-sm">
          <p className="font-bold">Macronutrient Breakdown</p>
          <ul className="list-disc pl-5">
            <li>Protein: {protein}g</li>
            <li>Carbs: {carbs}g</li>
            <li>Fats: {fats}g</li>
          </ul>
        </div>

        <div className="mt-3 flex">
          <button
            onClick={onFollow}
            className={`flex-1 text-white py-2 px-4 rounded-lg text-sm transition-all duration-200 ${
              isFollowed
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#4B9CD3] hover:bg-green-600"
            }`}
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DietCard;
