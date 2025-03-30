const DietCard = ({ image, name, description, calories, meals, difficulty }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl w-full overflow-hidden hover:shadow-xl transition-all duration-200 ease-in-out border border-gray-200">
      {/* Image (Covers Top Half, Rounded Top Corners) */}
      <div className="w-full h-40">
        <img src={image} alt={name} className="w-full h-full object-cover rounded-t-xl" />
      </div>

      <div className="p-4">
        {/* Diet Name */}
        <h2 className="text-lg font-bold">{name}</h2>

        {/* Description */}
        <p className="text-gray-600 text-sm">{description}</p>

        {/* Stats (Labels on One Line, Values Below) */}
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

        {/* View Details Button */}
        <button className="mt-3 bg-[#4B9CD3] text-white py-2 px-4 rounded-lg w-full text-sm hover:bg-blue-600 transition-all duration-200">
          View Details
        </button>
      </div>
    </div>
  );
};

export default DietCard;
