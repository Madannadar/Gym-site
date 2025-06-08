import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Diet from './pages/Diet.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import MealTracker from './pages/MealTracker.jsx'
import Nutrition from './pages/Nutrition.jsx'
import CustomDiet from './pages/CustomDiet.jsx'
import NewMeal from './pages/NewMeal.jsx'
import Attendance from './pages/Attendance.jsx'
import TrainerAttendance from './pages/TrainerAttendance.jsx'
import BmiCalculator from './pages/bmiCalculator.jsx'
import Workout from './pages/Workout.jsx'
import Event from './pages/AllEvents.jsx'
import Leaderboard from './pages/Leaderboards.jsx'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/meal-tracker" element={<MealTracker />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/custom-diet" element={<CustomDiet />} />
        <Route path="/new-meal" element={<NewMeal />} />
        <Route path="/user-attendance" element={<Attendance />} />
        <Route path="/trainer-attendance" element={<TrainerAttendance />} />
        <Route path="/bmi-calculator" element={<BmiCalculator />} />
        <Route path="/workouts" element={<Workout />} />
        <Route path="/events" element={<Event />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  )
}

export default App
