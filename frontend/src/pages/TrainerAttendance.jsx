import { useState, useEffect } from "react";
import { FaCalendar, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import QR from "../assets/QR.jpeg";

const TrainerAttendance = () => {
  const navigate = useNavigate();

  // Mock data (replace with API call or context in a real app)
  const [totalAttendance, setTotalAttendance] = useState(7); // Total users for the day
  const [attendanceList, setAttendanceList] = useState([
    { time: "7:30 am", name: "XYZ ABC PQR" },
    { time: "8:30 am", name: "Narendra Modi" },
    { time: "9:20 am", name: "Virat Kohli" },
    { time: "10:00 am", name: "Nil Nil Mukesh" },
    { time: "11:30 am", name: "Ramlal" },
  ]);

  // Simulate fetching data (replace with actual API logic)
  useEffect(() => {
    setTotalAttendance(7);
    setAttendanceList([
      { time: "7:30 am", name: "XYZ ABC PQR" },
      { time: "8:30 am", name: "Narendra Modi" },
      { time: "9:20 am", name: "Virat Kohli" },
      { time: "10:00 am", name: "Nil Nil Mukesh" },
      { time: "11:30 am", name: "Ramlal" },
    ]);
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-lg min-h-screen mt-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl sm:text-3xl text-[#4B9CD3]">👤</span>
        <h1 className="text-2xl sm:text-4xl font-bold text-black">Attendance Tracker</h1>
      </div>

      {/* QR Section */}
      <div className="flex justify-center items-center mb-8 min-h-[300px]">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">Today's Attendance QR</h2>
          <div className="flex justify-center items-center">
            <img
              src={QR}
              alt="Today's Attendance QR"
              className="w-[200px] sm:w-[250px] object-contain"
            />
          </div>
          <p className="text-sm sm:text-base mt-2 text-gray-600">
            Scan this qr to get today's attendance
          </p>
        </div>
      </div>

      {/* Total Attendance */}
      <div className="shadow-lg rounded-xl overflow-hidden mb-8 border border-gray-200 bg-white hover:shadow-xl transition-all duration-200 ease-in-out">
        <div className="p-6 sm:p-8">
          <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-4">Todays Attendance</h3>
          <div className="flex items-center gap-3">
            <FaUser className="text-gray-500 text-lg sm:text-xl" />
            <span className="text-sm sm:text-base">Total</span>
            <span className="ml-auto font-semibold text-gray-900 text-sm sm:text-base">
              {totalAttendance}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-200 ease-in-out">
        <div className="p-6 sm:p-8">
          <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaCalendar className="text-gray-500" /> Attendance
          </h3>
          <table className="w-full table-fixed text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100 text-gray-500">
                <th className="text-left py-3 px-4 sm:px-6 w-1/2">Time</th>
                <th className="text-left py-3 px-4 sm:px-6 w-1/2">Name</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.map((entry, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="py-4 px-4 sm:px-6">{entry.time}</td>
                  <td className="py-4 px-4 sm:px-6">{entry.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainerAttendance;
