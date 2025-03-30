import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Diet from './pages/Diet.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import MealTracker from './pages/MealTracker.jsx'
import Nutrition from './pages/Nutrition.jsx'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/meal-tracker" element={<MealTracker />} />
        <Route path="/nutrition" element={<Nutrition />} />
      </Routes>
    </Router>
  )
}

export default App
