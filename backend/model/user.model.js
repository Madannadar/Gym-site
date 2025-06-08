import db from "../config/db.js";

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

export const updateSubscription = async (user_id, subscription) => {
  const { rows } = await db.query(
    "UPDATE users SET subscription = $1 WHERE user_id = $2 RETURNING *;",
    [subscription, user_id],
  );
  return rows[0];
};
