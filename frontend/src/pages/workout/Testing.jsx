// import React from 'react'
// import axios from 'axios';
// import { useState } from 'react';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../AuthProvider';

// const API_URL = import.meta.env.VITE_BACKEND_URL;
// const Testing = () => {
//     const [regiments, setRegiments] = useState([])
//     const [recentRegiments, setRecentRegiments] = useState([])
//     const [workoutNames, setWorkoutNames] = useState({})
//     const [workoutLogs, setWorkoutLogs] = useState([])

//     const navigate = useNavigate();
//     const { uid } = useAuth();
//     const userId = Number(uid)

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const regRes = await axios.get(`${API_URL}/workouts/regiments`)
//                 const regimentData = regRes.data.items || []
//                 setRegiments(regimentData); 

//                 const recentSystemRegiments = regimentData
//                     .filter((r) => Number(r.created_by) !== userId)
//                     .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//                     .slice(0, 5);
//                 setRecentRegiments(recentSystemRegiments);

//                 const workoutIds = new Set()
//                 regimentData.forEach((reg) => {
//                     reg.workout_structure.forEach((day) => {
//                         if(day.workout_id) workoutIds.add(day.workout_id)
//                     })
//                 })

//                 const nameMap = {} // stores all the name of workout from their id 
//                 await Promise.all(
//                     [...workoutIds].map(async(id) => {
//                         const res = await axios.get(`${API_URL}/workouts/${id}`)
//                         nameMap[id] = res.data?.item?.name || `Workout ${id}`
//                     }
//                 ))
//                 setWorkoutNames(nameMap)

//                 const logRes = await axios.get(`${API_URL}/workouts/logs/user${userId}`);
//                 const logs = logRes.data.items || []
//                 setWorkoutLogs(logs)

//                 const exerciseIdsFromLogs = new Set()
//                 logs.forEach(log => {
//                     log.actual_workout?.forEach(ex => {
//                         if(ex.exercise_id) exerciseIdsFromLogs.add(ex.exercise_id)
//                     })
//                 })

//                 const namesMap = {}
//                 await Promise.app([...exerciseIdsFromLogs].map(async(id) => {
//                     try {
//                         const res = await axios.get(`${API_URL}/workouts/exercises/${id}`);
//                         nameMap[id] = res.data?.item?.name || `Exercise ${id}`
//                     } catch (error) {
                        
//                     }
//                 }))                

//             } catch (error) {
//                 console.error(error)
//             }
//         }
//     })

//   return (
//     <div>
      
//     </div>
//   )
// }

// export default Testing

