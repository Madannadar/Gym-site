import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import Event from './pages/events';
import EventLeaderboard from './components/events/eventLeaderboard';
import Leaderboard from './pages/leaderboard';
import BmiCalculator from './pages/bmiCalculator';
function App() {

  return (
    <div className="App">
    
    <Router>
      <Routes>
        <Route path="/events" element={<Event/>}/>
        <Route path="/eventLeaderboard" element={<EventLeaderboard/>}/>
        <Route path="/leaderboard" element={<Leaderboard/>}/>
        <Route path="/bmi" element={<BmiCalculator/>}/>
      </Routes>
    </Router>
  </div>
  );
}

export default App
