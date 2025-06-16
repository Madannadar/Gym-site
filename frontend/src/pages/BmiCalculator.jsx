import { useState, useEffect } from "react";
import { apiClient } from "../AxiosSetup";
import BmiLogo from "../assets/logos/bmiLogo";
import { useAuth } from "../AuthProvider";

const SkeletonLoader = () => (
  <div className="p-4 sm:p-6 max-w-lg mx-auto animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
    <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
    <div className="p-6 mt-5 bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

export default function BmiCalculator() {
  const { uid, authenticated, loading: authLoading } = useAuth();
  const [bmi, setBmi] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [classification, setClassification] = useState("");
  const [color, setColor] = useState(null);
  const [bmiData, setBmiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sendData = async (bmiValue) => {
    if (!authenticated || !uid) {
      setError("Please log in to save BMI data.");
      return;
    }
    try {
      const response = await apiClient.post(`/health-metrics/`, {
        user_id: parseInt(uid),
        log_type: "bmi",
        value: parseFloat(bmiValue),
        height: parseInt(height),
        weight: parseInt(weight),
        log_date: new Date().toISOString().split("T")[0],
      });
      console.log("Data sent successfully:", response.data);
      fetchLogs();
    } catch (error) {
      console.error("Error sending data:", error.response?.data || error);
      setError("Failed to save BMI data.");
    }
  };

  const calculateBmi = (height, weight) => {
    if (!height || !weight) {
      alert("Please enter both height and weight.");
      return;
    }
    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    let classification = "";
    let color = "";
    if (bmiValue < 18.5) {
      classification = "Underweight";
      color = "red";
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      classification = "Normal weight";
      color = "green";
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      classification = "Overweight";
      color = "orange";
    } else {
      classification = "Obese";
      color = "red";
    }
    setClassification(classification);
    setColor(color);

    sendData(bmiValue);
  };

  const fetchLogs = async () => {
    if (!authenticated || !uid) {
      setLoading(false);
      return;
    }
    try {
      const response = await apiClient.get(`/health-metrics/bmi/${uid}`);
      const data = response.data.logs || [];
      setBmiData(data);
      console.log("Fetched BMI logs:", data);
    } catch (err) {
      console.error("Error fetching logs:", err.response?.data || err);
      setError("Failed to fetch BMI logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [uid, authenticated]);

  if (authLoading || loading) return <SkeletonLoader />;
  if (!authenticated) return <p className="p-4 text-red-500">Please log in to use the BMI Calculator.</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

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
            Weight
          </label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your weight in kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className="block text-lg font-semibold text-gray-800">
            Height
          </label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your height in cm"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
        <button
          className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-[#3588a2] transition duration-200 ease-in-out"
          onClick={() => calculateBmi(height, weight)}
        >
          CALCULATE
        </button>
        {bmi && (
          <div className="text-center mt-6">
            <h1 className="text-3xl font-semibold text-gray-800">
              YOUR BMI IS: {bmi}
            </h1>
            <h5 className="mt-3 text-lg">
              Classification:
              <span className={`text-${color}-500`}> {classification} </span>
            </h5>
          </div>
        )}
      </div>
      <div className="p-6 mt-5 bg-white shadow-lg rounded-lg border border-gray-200">
        <h5>Past Records:</h5>
        {bmiData.length > 0 ? (
          bmiData.map((entry, index) => (
            <div key={index} className="flex justify-between items-center mt-5">
              <div className="flex items-center space-x-2 w-1/3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    entry.value < 18.5
                      ? "bg-blue-500"
                      : entry.value < 24.9
                      ? "bg-green-500"
                      : entry.value < 29.9
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                ></span>
                <span className="text-lg font-semibold">{entry.value}</span>
              </div>
              <div className="text-sm text-gray-600 w-1/3 text-center">
                {parseInt(entry.height)}cm • {entry.weight}kg
              </div>
              <div className="text-sm text-gray-500 w-1/3 text-right">
                {entry.created_at.slice(0, 10)}, {entry.created_at.slice(11, 16)}
              </div>
            </div>
          ))
        ) : (
          <p>NO DATA AVAILABLE</p>
        )}
      </div>
    </div>
  );
}
