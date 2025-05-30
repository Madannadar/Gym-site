import {
  recordUser,
  fetchAllUsers,
  fetchUserById,
  fetchUserByEmail,
  updateUserName,
  updateUserVegetarian,
  updateUserPassword,
  updateUserSubscription,
  deleteUserById,
} from "../models/user.model.js";
import bcrypt from "bcrypt";

const recordUserAccount = async (req, res) => {
  try {
    const { name, email, password, is_vegetarian, subscription } = req.body;

    const existing = await fetchUserByEmail(email);
    if (existing)
      return res.status(400).json({ error: "Email already in use" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await recordUser({
      name,
      email,
      password_hash,
      is_vegetarian,
      subscription,
    });

    res.status(201).json({ item: user });
  } catch (err) {
    console.error("❌ Record User Error:", err.stack);
    res.status(500).json({ error: "Failed to record user" });
  }
};

const fetchAllUsers = async (req, res) => {
  try {
    const users = await fetchAllUsers();
    res.json({ items: users });
  } catch (err) {
    console.error("❌ Fetch Users Error:", err.stack);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const fetchUserById = async (req, res) => {
  try {
    const user = await fetchUserById(req.params.user_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ item: user });
  } catch (err) {
    console.error("❌ Fetch User Error:", err.stack);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const updateUserNameById = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await updateUserName(req.params.user_id, name);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ item: user });
  } catch (err) {
    console.error("❌ Update Name Error:", err.stack);
    res.status(500).json({ error: "Failed to update name" });
  }
};

const updateUserVegetarianById = async (req, res) => {
  try {
    const { is_vegetarian } = req.body;
    const user = await updateUserVegetarian(req.params.user_id, is_vegetarian);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ item: user });
  } catch (err) {
    console.error("❌ Update Vegetarian Error:", err.stack);
    res.status(500).json({ error: "Failed to update vegetarian preference" });
  }
};

const updateUserPasswordById = async (req, res) => {
  try {
    const { password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await updateUserPassword(req.params.user_id, password_hash);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      message: "Password updated successfully",
      item: { user_id: user.user_id },
    });
  } catch (err) {
    console.error("❌ Update Password Error:", err.stack);
    res.status(500).json({ error: "Failed to update password" });
  }
};

const updateUserSubscriptionById = async (req, res) => {
  try {
    const { subscription } = req.body;
    const user = await updateUserSubscription(req.params.user_id, subscription);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ item: user });
  } catch (err) {
    console.error("❌ Update Subscription Error:", err.stack);
    res.status(500).json({ error: "Failed to update subscription" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user = await deleteUserById(req.params.user_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted", item: user });
  } catch (err) {
    console.error("❌ Delete User Error:", err.stack);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export {
  recordUserAccount,
  fetchAllUsers,
  fetchUserById,
  updateUserNameById,
  updateUserVegetarianById,
  updateUserPasswordById,
  updateUserSubscriptionById,
  deleteUserById,
};
