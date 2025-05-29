import db from "../config/db.js";

export const insertUser = async ({
  name,
  email,
  password_hash,
  is_vegetarian = false,
}) => {
  const query = `
    INSERT INTO users (name, email, password_hash, is_vegetarian)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, email, password_hash, is_vegetarian];
  const result = await db.query(query, values);
  return result.rows[0];
};
