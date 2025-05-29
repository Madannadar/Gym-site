import db from "../config/db.js";

export const createUser = async (req, res) => {
  const { name, email, password_hash, is_vegetarian } = req.body;

  if (!name || !email || !password_hash) {
    return res.status(400).json({ error: "Name, email, and password_hash are required." });
  }

  const query = `
    INSERT INTO users (name, email, password_hash, is_vegetarian)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [name, email, password_hash, is_vegetarian ?? false];

  try {
    const result = await db.query(query, values);
    return res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error("❌ Failed to create user:", err.stack);
    return res.status(500).json({ error: "Failed to create user." });
  }
};
