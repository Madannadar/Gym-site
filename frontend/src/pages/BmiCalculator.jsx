import { useState } from "react";

// import BmiLogo from "../assets/images/bmiLogo";
import BmiLogo from "../assets/logos/bmiLogo";

export default function BmiCalculator() {
  const [bmi, setBmi] = useState("34");
  const [classification, setClassification] = useState("Obese");
  const bmiData = [
    {
      bmi: 23.1,
      height: 180,
      weight: 75,
      gender: "male",
      date: "25/6",
      time: "5:00PM",
      color: "green",
    },
    {
      bmi: 24.7,
      height: 180,
      weight: 80,
      gender: "male",
      date: "9/8",
      time: "4:30PM",
      color: "green",
    },
    {
      bmi: 26.2,
      height: 180,
      weight: 85,
      gender: "male",
      date: "25/7",
      time: "5:30PM",
      color: "yellow",
    },
    {
      bmi: 27.8,
      height: 180,
      weight: 90,
      gender: "male",
      date: "15/7",
      time: "9:30PM",
      color: "orange",
    },
    {
      bmi: 30.4,
      height: 180,
      weight: 100,
      gender: "male",
      date: "30/6",
      time: "5:30PM",
      color: "orange",
    },
    {
      bmi: 32.4,
      height: 180,
      weight: 105,
      gender: "male",
      date: "15/6",
      time: "5:30PM",
      color: "red",
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <BmiLogo />
          <h1 className="text-2xl sm:text-4xl font-bold text-black px-0.5">
            BMI Calculator
          </h1>
        </div>

        <div className="mt-4">
          <label className="block text-lg font-semibold text-gray-800">
            Age
          </label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your age"
          />
        </div>

        <div className="mt-4">
          <label className="block text-lg font-semibold text-gray-800">
            Weight
          </label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your weight in kg"
          />
        </div>

        <div className="mt-4">
          <label className="block text-lg font-semibold text-gray-800">
            Height
          </label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your height in cm"
          />
        </div>

        <div className="flex justify-center gap-5 mt-5">
          <button className="bg-gray-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-gray-600 transition duration-200">
            Male
          </button>
          <button className="bg-blue-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-blue-600 transition duration-200">
            Female
          </button>
        </div>

        <button className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-[#3588a2] transition duration-200 ease-in-out">
          CALCULATE
        </button>

        {bmi && (
          <div className="text-center align mt-6 ">
            <h1 className="text-3xl font-semibold text-gray-800">
              YOUR BMI IS: {bmi}
            </h1>
            <h5 className="mt-3 text-lg">
              Classification:{" "}
              <span className="text-red-500"> {classification} </span>{" "}
            </h5>
          </div>
        )}
      </div>

      <div className="p-6 mt-5 bg-white shadow-lg rounded-lg border border-gray-200">
        <h5>Past Records:</h5>
        {bmiData.map((entry, index) => (
          <div key={index} className="flex justify-between items-center mt-5">
            {/* Colored dot + BMI */}
            <div className="flex items-center space-x-2 w-1/3">
              <span
                className={`h-3 w-3 rounded-full ${
                  entry.color === "green"
                    ? "bg-green-500"
                    : entry.color === "yellow"
                    ? "bg-yellow-500"
                    : entry.color === "orange"
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
              ></span>
              <span className="text-lg font-semibold">{entry.bmi}</span>
            </div>

            {/* Height, weight, gender */}
            <div className="text-sm text-gray-600 w-1/3 text-center">
              {entry.height}cm • {entry.weight}kg • {entry.gender}
            </div>

            {/* Date and Time */}
            <div className="text-sm text-gray-500 w-1/3 text-right">
              {entry.date}, {entry.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
