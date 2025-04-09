import { useState, useEffect } from "react";
import { FaQrcode, FaClock, FaCalendar, FaPercentage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const navigate = useNavigate();

  const [monthlyWorkoutTime, setMonthlyWorkoutTime] = useState(540);
  const [attendanceRate, setAttendanceRate] = useState(70);
  const [recentAttendance, setRecentAttendance] = useState([
    { date: "2023-06-01", status: "Attended", duration: "75 min" },
    { date: "2023-06-06", status: "Missed", duration: "-" },
    { date: "2023-06-08", status: "Attended", duration: "120 min" },
    { date: "2023-06-09", status: "Attended", duration: "60 min" },
    { date: "2023-06-10", status: "Attended", duration: "90 min" },
  ]);

  useEffect(() => {
    setMonthlyWorkoutTime(540);
    setAttendanceRate(70);
    setRecentAttendance([
      { date: "2023-04-01", status: "Attended", duration: "75 min" },
      { date: "2023-04-02", status: "Missed", duration: "-" },
      { date: "2023-04-03", status: "Attended", duration: "120 min" },
      { date: "2023-04-04", status: "Attended", duration: "60 min" },
      { date: "2023-04-05", status: "Attended", duration: "90 min" },
    ]);
  }, []);

  const handleScanQR = () => {
    alert("QR Scanner would open here. Implement QR scanning logic!");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-lg min-h-screen mt-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl sm:text-3xl text-[#4B9CD3]">👤</span>
        <h1 className="text-2xl sm:text-4xl font-bold text-black">Attendance Tracker</h1>
      </div>

      {/* QR Section */}
      <div
        className="bg-[#4B9CD3] text-white p-4 sm:p-6 rounded-lg mb-8 cursor-pointer hover:bg-blue-500 transition-all duration-200 flex justify-center items-center min-h-[200px]"
        onClick={handleScanQR}
      >
        <div className="flex items-center space-x-6">
          <div className="relative">
            <FaQrcode className="text-[80px] sm:text-[100px]" style={{ padding: "8px" }} />
            <span className="absolute top-0 left-0 border-t-4 border-l-4 border-white w-4 h-4"></span>
            <span className="absolute top-0 right-0 border-t-4 border-r-4 border-white w-4 h-4"></span>
            <span className="absolute bottom-0 left-0 border-b-4 border-l-4 border-white w-4 h-4"></span>
            <span className="absolute bottom-0 right-0 border-b-4 border-r-4 border-white w-4 h-4"></span>
          </div>
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold">Get todays</h2>
            <div className="text-2xl sm:text-3xl font-bold">Attendance</div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="shadow-lg rounded-xl overflow-hidden mb-8 border border-gray-200 bg-white hover:shadow-xl transition-all duration-200 ease-in-out">
        <div className="p-6 sm:p-8">
          <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-4">You This Month</h3>
          <div className="flex items-center gap-3 mb-4 py-2 border-t border-gray-100">
            <FaClock className="text-gray-500 text-lg sm:text-xl" />
            <span className="text-sm sm:text-base">Workout Time</span>
            <span className="ml-auto font-semibold text-gray-900 text-sm sm:text-base">
              {monthlyWorkoutTime} min
            </span>
          </div>
          <div className="flex items-center gap-3">
            <FaPercentage className="text-gray-500 text-lg sm:text-xl" />
            <span className="text-sm sm:text-base">Attendance Rate</span>
            <span className="ml-auto font-semibold text-gray-900 text-sm sm:text-base">
              {attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Recent Attendance Table */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-200 ease-in-out">
        <div className="p-6 sm:p-8">
          <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaCalendar className="text-gray-500" /> Recent Attendance
          </h3>
          <table className="w-full table-fixed text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100 text-gray-500">
                <th className="text-left py-3 px-4 sm:px-6 w-1/3">Date</th>
                <th className="text-left py-3 px-4 sm:px-6 w-1/3">Status</th>
                <th className="text-left py-3 px-4 sm:px-6 w-1/3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((entry, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="py-4 px-4 sm:px-6">{entry.date}</td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                        entry.status === "Attended"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6">{entry.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
