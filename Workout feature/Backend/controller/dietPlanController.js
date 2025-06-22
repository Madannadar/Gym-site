// import { 
//   createDietPlan, 
//   getAllDietPlans, 
//   getDietPlanById, 
//   updateDietPlan, 
//   deleteDietPlan 
// } from "../models/DietPlan.js";

// // Controller to create a new diet plan
// export const createDietPlanController = async (req, res) => {
//   try {
//     const { name, description, difficulty, diet_type, tags } = req.body;

//     const newDietPlan = await createDietPlan({
//       name,
//       description,
//       difficulty,
//       diet_type,
//       tags,
//     });

//     res.status(201).json(newDietPlan);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to create diet plan" });
//   }
// };


// // Controller to fetch all diet plans
// export const getAllDietPlansController = async (req, res) => {
//   try {
//     const dietPlans = await getAllDietPlans();
//     res.status(200).json(dietPlans);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch diet plans" });
//   }
// };

// // Controller to fetch a diet plan by ID
// export const getDietPlanByIdController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const dietPlan = await getDietPlanById(id);
//     res.status(200).json(dietPlan);
//   } catch (error) {
//     console.error(error);
//     res.status(404).json({ error: "Diet plan not found" });
//   }
// };

// export const updateDietPlanController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description, difficulty, diet_type, tags } = req.body;

//     const updatedDietPlan = await updateDietPlan(id, {
//       name,
//       description,
//       difficulty,
//       diet_type,
//       tags,
//     });

//     res.status(200).json(updatedDietPlan);
//   } catch (error) {
//     console.error(error);
//     if (error.message === 'Diet plan not found') {
//       res.status(404).json({ error: "Diet plan not found" });
//     } else {
//       res.status(500).json({ error: "Failed to update diet plan" });
//     }
//   }
// };

// // Controller to delete a diet plan
// export const deleteDietPlanController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedDietPlan = await deleteDietPlan(id);
//     res.status(200).json({ 
//       message: "Diet plan deleted successfully", 
//       deletedDietPlan 
//     });
//   } catch (error) {
//     console.error(error);
//     if (error.message === 'Diet plan not found') {
//       res.status(404).json({ error: "Diet plan not found" });
//     } else {
//       res.status(500).json({ error: "Failed to delete diet plan" });
//     }
//   }
// };