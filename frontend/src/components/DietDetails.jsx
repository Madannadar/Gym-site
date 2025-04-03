import { FaTimes } from "react-icons/fa";

const DietDetailsModal = ({ diet, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white bg-opacity-90 p-4 sm:p-6 rounded-lg w-full max-w-md mx-4 sm:mx-0 shadow-lg border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">{diet.name}</h1>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">{diet.description}</p>

        {/* Stats Section */}
        <div className="flex justify-between text-gray-700 text-sm mb-4">
          <div className="flex-1 text-center">
            <p className="font-semibold">Calories</p>
            <p>{diet.calories}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-semibold">Meals</p>
            <p>{diet.meals}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-semibold">Difficulty</p>
            <p>{diet.difficulty}</p>
          </div>
        </div>

        {/* Daily Macronutrient Requirements */}
        <div className="text-gray-700">
          <p className="font-semibold mb-2">Daily Macronutrient Requirements</p>
          <ul className="list-disc pl-5 text-sm">
            <li>Protein: {diet.protein}g</li>
            <li>Carbs: {diet.carbs}g</li>
            <li>Fats: {diet.fats}g</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-[#4B9CD3] text-white rounded-lg text-sm hover:bg-blue-600 transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DietDetailsModal;
