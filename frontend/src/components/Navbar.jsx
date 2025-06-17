import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaClipboardList,
  FaWeight,
  FaAppleAlt,
  FaDumbbell,
  FaCalendarAlt,
  FaTrophy,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../AuthProvider"; // adjust path

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { authenticated } = useAuth(); // ✅ from context

  const handleLogout = () => {
    navigate("/logout");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const navItems = [
    { name: "Home", icon: <FaHome />, path: "/" },
    { name: "Attendance", icon: <FaClipboardList />, path: "/user-attendance" },
    { name: "BMI Calculator", icon: <FaWeight />, path: "/bmi-calculator" },
    { name: "Diet", icon: <FaAppleAlt />, path: "/diet" },
    { name: "Workouts", icon: <FaDumbbell />, path: "/Workout_Management" },
    { name: "Events", icon: <FaCalendarAlt />, path: "/events" },
    { name: "Leaderboard", icon: <FaTrophy />, path: "/leaderboard" },
  ];

  const authButton = authenticated ? (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-red-500 hover:text-red-600 transition"
    >
      <FaSignOutAlt /> Logout
    </button>
  ) : (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
    >
      <FaSignInAlt /> Login
    </button>
  );

  return (
    <nav className="bg-white shadow-md px-6 py-3 mb-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 -ml-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            L
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Logo
          </span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 text-gray-800 font-medium items-center">
          {navItems.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition"
            >
              <Link to={item.path} className="flex items-center gap-2">
                {item.icon} {item.name}
              </Link>
            </li>
          ))}
          <li>{authButton}</li>
        </ul>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden mt-3 bg-white border-t border-gray-200 shadow-md py-2">
          {navItems.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 cursor-pointer transition"
            >
              <Link
                to={item.path}
                className="flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                {item.icon} <span>{item.name}</span>
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 cursor-pointer transition">
            <button
              onClick={() => {
                setIsOpen(false);
                authenticated ? handleLogout() : handleLogin();
              }}
              className="flex items-center gap-2 text-sm"
            >
              {authenticated ? <FaSignOutAlt /> : <FaSignInAlt />}
              {authenticated ? "Logout" : "Login"}
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
