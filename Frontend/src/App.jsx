import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Workout from './pages/workout'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workouts" element={<Workout />} />
    </Routes>
  )
}

export default App
