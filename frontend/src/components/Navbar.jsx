import { useState } from "react";
import { FaBars, FaTimes, FaHome, FaClipboardList, FaWeight, FaAppleAlt, FaDumbbell, FaCalendarAlt, FaTrophy } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Navigation items with icons
  const navItems = [
    { name: "Home", icon: <FaHome /> },
    { name: "Attendance", icon: <FaClipboardList /> },
    { name: "BMI Calculator", icon: <FaWeight /> },
    { name: "Diet", icon: <FaAppleAlt /> },
    { name: "Workouts", icon: <FaDumbbell /> },
    { name: "Events", icon: <FaCalendarAlt /> },
    { name: "Leaderboard", icon: <FaTrophy /> },
  ];

  return (
    <nav className="bg-white shadow-md px-6 py-3 mb-8"> {/* Reduced height (py-3) */}
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo (slightly left-aligned) */}
        <div className="flex items-center gap-2 -ml-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            L
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Logo
          </span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 text-gray-800 font-medium">
          {navItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition">
              {item.icon} {item.name}
            </li>
          ))}
        </ul>

        {/* Hamburger Icon (Mobile) */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden mt-3 bg-white border-t border-gray-200 shadow-md py-2">
          {navItems.map((item, index) => (
            <li key={index} className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 cursor-pointer transition">
              {item.icon} <span className="text-gray-800 font-medium">{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
