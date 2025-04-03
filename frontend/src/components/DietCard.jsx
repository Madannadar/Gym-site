import { useState } from "react";
import DietDetails from "./DietDetails.jsx";

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
  isFollowed, // New prop to differentiate followed card
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div
      className={`shadow-lg rounded-xl w-full overflow-hidden hover:shadow-xl transition-all duration-200 ease-in-out border border-gray-200 ${
        isFollowed ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="p-4">
        <h2 className="text-lg font-bold">{name}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
        <div className="flex justify-between text-gray-700 text-sm mt-3 text-center">
          <div className="flex-1">
            <p className="font-bold">Calories</p>
            <p>{calories}</p>
          </div>
          <div className="flex-1">
            <p className="font-bold">Meals</p>
            <p>{meals}</p>
          </div>
          <div className="flex-1">
            <p className="font-bold">Difficulty</p>
            <p>{difficulty}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-[#4B9CD3] text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition-all duration-200"
          >
            View
          </button>
          <button
            onClick={onFollow}
            className={`flex-1 text-white py-2 px-4 rounded-lg text-sm transition-all duration-200 ${
              isFollowed
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>

      {showModal && (
        <DietDetails
          diet={{ name, description, calories, meals, difficulty, protein, carbs, fats }}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default DietCard;
