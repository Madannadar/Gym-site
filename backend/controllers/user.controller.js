import {
  // createUser,
  // getAllUsers,
  // getUserById,
  // getUserByEmail,
  updateName,
  updateVegetarian,
  // updatePassword,
  updateSubscription,
  // deleteUser,
} from "../model/user.model.js";
import bcrypt from "bcrypt";

// // Create user
// export const handleCreateUser = async (req, res) => {
//   try {
//     const { name, email, password, is_vegetarian, subscription } = req.body;

//     const existing = await getUserByEmail(email);
//     if (existing)
//       return res.status(400).json({ error: "Email already in use" });

//     const password_hash = await bcrypt.hash(password, 10);
//     const user = await createUser({
//       name,
//       email,
//       password_hash,
//       is_vegetarian,
//       subscription,
//     });

//     res.status(201).json({ user });
//   } catch (err) {
//     console.error("❌ Create User Error:", err.stack);
//     res.status(500).json({ error: "Failed to create user" });
//   }
// };

// Fetchers
// export const handleGetAllUsers = async (req, res) => {
//   try {
//     const users = await getAllUsers();
//     res.json({ users });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// };

// export const handleGetUserById = async (req, res) => {
//   try {
//     const user = await getUserById(req.params.user_id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// };

// Update name
export const handleUpdateName = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await updateName(req.params.user_id, name);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update name" });
  }
};

// Update vegetarian preference
export const handleUpdateVegetarian = async (req, res) => {
  try {
    const { is_vegetarian } = req.body;
    const user = await updateVegetarian(req.params.user_id, is_vegetarian);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update vegetarian preference" });
  }
};

// Update password
// export const handleUpdatePassword = async (req, res) => {
//   try {
//     const { password } = req.body;
//     const password_hash = await bcrypt.hash(password, 10);
//     const user = await updatePassword(req.params.user_id, password_hash);
//     res.json({
//       message: "Password updated successfully",
//       user_id: user.user_id,
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update password" });
//   }
// };

// Update subscription
export const handleUpdateSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const user = await updateSubscription(req.params.user_id, subscription);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update subscription" });
  }
};

// Delete user
// export const handleDeleteUser = async (req, res) => {
//   try {
//     const user = await deleteUser(req.params.user_id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json({ message: "User deleted", user });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to delete user" });
//   }
// };
