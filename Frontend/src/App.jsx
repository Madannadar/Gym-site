import React from 'react';
import AddExercise from './pages/AddExercise';
import AddWorkout from './pages/AddWorkout';
import AddRegiment from './pages/AddRegiment';
import Home from './pages/Home';
import { Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='create-exercise' element={<AddExercise />} />
      <Route path='create-workout' element={<AddWorkout />} />
      <Route path='create-regiment' element={<AddRegiment />} />
    </Routes>
  );
};

export default App;
