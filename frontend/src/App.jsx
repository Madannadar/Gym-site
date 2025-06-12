import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Diet from "./pages/Diet.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import MealTracker from "./pages/MealTracker.jsx";
import Nutrition from "./pages/Nutrition.jsx";
import CustomDiet from "./pages/CustomDiet.jsx";
import NewMeal from "./pages/NewMeal.jsx";
import Attendance from "./pages/Attendance.jsx";
import TrainerAttendance from "./pages/TrainerAttendance.jsx";
import BmiCalculator from "./pages/BmiCalculator.jsx";
import Workout from "./pages/Workout.jsx";
import Events from "./pages/Events.jsx";
import Leaderboards from "./pages/Leaderboards.jsx";
import EventLeaderboard from "./components/events/EventLeaderboard.jsx";

import Login from "./pages/LoginPage.jsx";
import Signup from "./pages/SignUpPage.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Loader from "./pages/Loader.jsx";
import Logout from "./pages/Logout.jsx";
import { AuthProvider, useAuth } from "./AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { authenticated } = useAuth();

  if (authenticated === null) {
    return <Loader />;
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet"
            element={
              <ProtectedRoute>
                <Diet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-tracker"
            element={
              <ProtectedRoute>
                <MealTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nutrition"
            element={
              <ProtectedRoute>
                <Nutrition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-diet"
            element={
              <ProtectedRoute>
                <CustomDiet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-meal"
            element={
              <ProtectedRoute>
                <NewMeal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer-attendance"
            element={
              <ProtectedRoute>
                <TrainerAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bmi-calculator"
            element={
              <ProtectedRoute>
                <BmiCalculator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <Workout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventLeaderboard"
            element={
              <ProtectedRoute>
                <EventLeaderboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
