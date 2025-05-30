import db from "../config/db.js";

export const createUser = async ({
  name,
  email,
  password_hash,
  is_vegetarian = false,
  subscription = "free",
}) => {
  const query = `
    INSERT INTO users (name, email, password_hash, is_vegetarian, subscription)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [name, email, password_hash, is_vegetarian, subscription];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getAllUsers = async () => {
  const { rows } = await db.query(
    "SELECT * FROM users ORDER BY created_at DESC;",
  );
  return rows;
};

export const getUserById = async (user_id) => {
  const { rows } = await db.query("SELECT * FROM users WHERE user_id = $1;", [
    user_id,
  ]);
  return rows[0];
};

export const getUserByEmail = async (email) => {
  const { rows } = await db.query("SELECT * FROM users WHERE email = $1;", [
    email,
  ]);
  return rows[0];
};

export const updateName = async (user_id, name) => {
  const { rows } = await db.query(
    "UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *;",
    [name, user_id],
  );
  return rows[0];
};

export const updateVegetarian = async (user_id, is_vegetarian) => {
  const { rows } = await db.query(
    "UPDATE users SET is_vegetarian = $1 WHERE user_id = $2 RETURNING *;",
    [is_vegetarian, user_id],
  );
  return rows[0];
};

export const updatePassword = async (user_id, password_hash) => {
  const { rows } = await db.query(
    "UPDATE users SET password_hash = $1 WHERE user_id = $2 RETURNING *;",
    [password_hash, user_id],
  );
  return rows[0];
};

export const updateSubscription = async (user_id, subscription) => {
  const { rows } = await db.query(
    "UPDATE users SET subscription = $1 WHERE user_id = $2 RETURNING *;",
    [subscription, user_id],
  );
  return rows[0];
};

export const deleteUser = async (user_id) => {
  const { rows } = await db.query(
    "DELETE FROM users WHERE user_id = $1 RETURNING *;",
    [user_id],
  );
  return rows[0];
};
