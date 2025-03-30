import { FaTimes } from "react-icons/fa";

const DietDetailsModal = ({ diet, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-md">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg border border-gray-200 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-gray-700 hover:text-gray-500"
        >
          <FaTimes />
        </button>
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">{diet.name}</h1>
        
        {/* Image */}
        <div className="w-full h-40 mb-4">
          <img
            src={diet.image}
            alt={diet.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">{diet.description}</p>

        {/* Stats Section */}
        <div className="flex justify-between text-gray-700 text-sm mt-3">
          <div className="flex-1 text-center">
            <p className="font-bold">Calories</p>
            <p>{diet.calories}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-bold">Meals</p>
            <p>{diet.meals}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-bold">Difficulty</p>
            <p>{diet.difficulty}</p>
          </div>
        </div>

        {/* Nutrition Breakdown */}
        <div className="mt-4 text-gray-700">
          <p className="font-medium">Nutrition Breakdown</p>
          <ul className="list-disc pl-6 text-sm">
            <li>Protein: {diet.protein}g</li>
            <li>Carbs: {diet.carbs}g</li>
            <li>Fats: {diet.fats}g</li>
          </ul>
        </div>

        {/* Meal Timing */}
        <div className="mt-4 text-gray-700">
          <p className="font-medium">Meal Timing</p>
          <p className="text-sm">Recommended Meal Schedule: {diet.mealTime}</p>
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#4B9CD3] text-white rounded-lg text-sm hover:bg-blue-600 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DietDetailsModal;
