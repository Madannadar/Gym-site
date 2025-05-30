import { insertUser } from "../model/user.model.js";

export const createUser = async (req, res) => {
  const { name, email, password_hash, is_vegetarian } = req.body;

  if (!name || !email || !password_hash) {
    return res
      .status(400)
      .json({ error: "Name, email, and password_hash are required." });
  }

  try {
    const newUser = await insertUser({
      name,
      email,
      password_hash,
      is_vegetarian,
    });
    return res.status(201).json({ user: newUser });
  } catch (err) {
    console.error("❌ Failed to create user:", err.stack);
    return res.status(500).json({ error: "Failed to create user." });
  }
};
