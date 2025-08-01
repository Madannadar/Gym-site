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
import RegimentForm from "./pages/workout/RegimentForm.jsx";

import AddExercise from "./pages/workout/AddExercise.jsx";
import AddWorkout from "./pages/workout/AddWorkout.jsx";
// import AddRegiment from "./pages/workout/AddRegiment.jsx";
// import WorkoutLogForm from "./pages/workout/AddWorkout_log.jsx";
import Workout_Management from "./pages/workout/Workout_Management.jsx";
import StartWorkout from "./pages/workout/StartWorkout.jsx";
// import UpdateRegiment from "./pages/workout/UpdateRegiment.jsx";
// import Testing from "./pages/workout/testing.jsx";

import Login from "./pages/LoginPage.jsx";
import Signup from "./pages/SignUpPage.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Loader from "./pages/Loader.jsx";
import Logout from "./pages/Logout.jsx";
import { AuthProvider, useAuth } from "./AuthProvider";
import { AuthCallback } from "./components/GoogleAuth.jsx";
import { MealProvider } from "./context/MealContext.jsx";
import AttendanceScanPage from "./pages/scanAttendenceQR.jsx";
import AttendanceHistoryPage from "./pages/UserAttendenceHistory.jsx";
import { Toaster } from "react-hot-toast";
import TodaysQRPage from "./pages/AttendenceQR.jsx";
import Footer from "./components/Footer.jsx";
import ImageInsertExample from "./components/imageGalaryComp.jsx";
const ProtectedRoute = ({ children }) => {
  const { authenticated, loading, isVerified } = useAuth();

  if (loading) return <Loader />;
  if (!authenticated) return <Navigate to="/login" replace />;
  if (isVerified === false) {
    // Show a message or redirect to verify email page
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Email Not Verified
        </h2>
        <p className="mb-4">
          Please verify your email address to access this page.
        </p>
        <Navigate to="/verify-email" replace />
      </div>
    );
  }
  return children;
};
const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    {/* <ImageInsertExample /> */}
    <Toaster />

    {/* Content area grows to fill space */}
    <main className="flex-1 pt-16">{children}</main>

    <Footer />
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/google/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/create-exercise" element={<AddExercise />} />
            <Route path="/create-workout" element={<AddWorkout />} />
            <Route path="/create-regiment" element={<RegimentForm />} />
            <Route
              path="/workouts/regiments/:regimentId"
              element={<RegimentForm />}
            />
            {/* <Route path="/create-workout_logs" element={<WorkoutLogForm />} /> */}
            <Route
              path="/start-workout/:regimenId/:workoutId"
              element={<StartWorkout />}
            />

            {/* Protected Routes */}
            <Route
              path="/Workout_Management"
              element={
                <ProtectedRoute>
                  <Workout_Management />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendence-scan"
              element={
                <ProtectedRoute>
                  <AttendanceScanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance-history"
              element={
                <ProtectedRoute>
                  <AttendanceHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <Home />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/diet"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <Diet />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-tracker"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <MealTracker />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <Nutrition />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-diet"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <CustomDiet />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-meal"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <NewMeal />
                  </MealProvider>
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
            <Route path="*" element={<Navigate to="/" replace />} />

            <Route
              path="/attendence-qr"
              element={
                <ProtectedRoute>
                  <TodaysQRPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance-scan"
              element={
                <ProtectedRoute>
                  <AttendanceScanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance-history"
              element={
                <ProtectedRoute>
                  <AttendanceHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <Home />
                  </MealProvider>
                </ProtectedRoute>
              }
            />

            {/* Diet-related routes with MealProvider */}
            <Route
              path="/diet"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <Diet />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-tracker"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <MealTracker />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <Nutrition />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-diet"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <CustomDiet />
                  </MealProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-meal"
              element={
                <ProtectedRoute>
                  <MealProvider>
                    <NewMeal />
                  </MealProvider>
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
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;
