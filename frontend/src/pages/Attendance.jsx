import { useState, useEffect } from "react";
import {
  FaQrcode,
  FaClock,
  FaCalendar,
  FaPercentage,
  FaFire,
  FaChartBar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

const Attendance = () => {
  const { uid } = useAuth();
  const navigate = useNavigate();
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [monthlyAttendenceLogs, setMonthlyAttendence] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const res = await apiClient.get(`/attendence/user/month/${uid}`);
        console.log(res);
        setMonthlyAttendence(res.data.monthly_attendance);

        setRecentAttendance(res.data.monthly_attendance.slice(0, 5));
        setMetrics(res.data.metrics);
      } catch (error) {
        console.log(toString(error));
        console.error("Failed to fetch attendance data", error);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleScanQR = () => {
    navigate("/attendence-scan");
  };

  const goToAttendancePage = () =>
    navigate("/attendance-history", {
      state: { monthlyAttendenceLogs, metrics },
    });

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-lg min-h-screen mt-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl sm:text-3xl text-[#4B9CD3]">👤</span>
        <h1 className="text-2xl sm:text-4xl font-bold text-black">
          Attendance Tracker
        </h1>
      </div>

      {/* QR Section */}
      <div
        className="bg-[#4B9CD3] text-white p-4 sm:p-6 rounded-lg mb-8 cursor-pointer hover:bg-blue-500 transition-all duration-200 flex justify-center items-center min-h-[200px]"
        onClick={handleScanQR}
      >
        <div className="flex items-center space-x-6">
          <div className="relative">
            <FaQrcode
              className="text-[80px] sm:text-[100px]"
              style={{ padding: "8px" }}
            />
            <span className="absolute top-0 left-0 border-t-4 border-l-4 border-white w-4 h-4"></span>
            <span className="absolute top-0 right-0 border-t-4 border-r-4 border-white w-4 h-4"></span>
            <span className="absolute bottom-0 left-0 border-b-4 border-l-4 border-white w-4 h-4"></span>
            <span className="absolute bottom-0 right-0 border-b-4 border-r-4 border-white w-4 h-4"></span>
          </div>
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold">Get today's</h2>
            <div className="text-2xl sm:text-3xl font-bold">Attendance</div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="shadow-lg rounded-xl overflow-hidden mb-8 border border-gray-200 bg-white hover:shadow-xl transition-all duration-200 ease-in-out">
        <div className="p-6 sm:p-8">
          <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-4">
            You This Month
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <FaClock className="text-gray-500 text-lg sm:text-xl" />
              <span className="text-sm sm:text-base">Monthly Workout Time</span>
              <span className="ml-auto font-semibold text-gray-900 text-sm sm:text-base">
                {metrics.monthlyDuration || 0} min
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaChartBar className="text-gray-500 text-lg sm:text-xl" />
              <span className="text-sm sm:text-base">Weekly Duration</span>
              <span className="ml-auto font-semibold text-gray-900 text-sm sm:text-base">
                {metrics.weeklyDuration || 0} min
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaCalendar className="text-gray-500 text-lg sm:text-xl" />
              <span className="text-sm sm:text-base">Total Days Attended</span>
              <span className="ml-auto font-semibold text-gray-900 text-sm sm:text-base">
                {metrics.totalDays || 0}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaFire className="text-gray-500 text-lg sm:text-xl" />
              <span className="text-sm sm:text-base">Current Streak</span>
              <span className="ml-auto font-semibold text-gray-900 text-sm sm:text-base">
                {metrics.streak || 0} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Table */}
      {recentAttendance.length > 0 && (
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-200 ease-in-out mb-6">
          <div className="p-6 sm:p-8">
            <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaCalendar className="text-gray-500" /> Last 5 Attendances
            </h3>
            <table className="w-full table-fixed text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100 text-gray-500">
                  <th className="text-left py-3 px-4 sm:px-6 w-1/3">Date</th>
                  <th className="text-left py-3 px-4 sm:px-6 w-1/3">Status</th>
                  <th className="text-left py-3 px-4 sm:px-6 w-1/3">
                    Duration
                  </th>
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
                    <td className="py-4 px-4 sm:px-6">
                      {entry.duration || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Button to Attendance History Page */}
      <div className="text-center">
        <button
          onClick={goToAttendancePage}
          className="px-6 py-3 bg-[#4B9CD3] text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-600 transition-all"
        >
          View Full Attendance History
        </button>
      </div>
    </div>
  );
};

export default Attendance;
