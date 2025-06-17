import db from "../config/db.js";

export const updateName = async (id, name) => {
  const { rows } = await db.query(
    "UPDATE users SET first_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;",
    [name, id]
  );
  return rows[0];
};

export const updateVegetarian = async (id, is_vegetarian) => {
  const { rows } = await db.query(
    "UPDATE users SET is_vegetarian = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;",
    [is_vegetarian, id]
  );
  return rows[0];
};

// Commented out until subscription column is added
/*
export const updateSubscription = async (id, subscription) => {
  const { rows } = await db.query(
    "UPDATE users SET subscription = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;",
    [subscription, id]
  );
  return rows[0];
};
*/

export const updateSelectedTemplateModel = async (id, selected_template_id) => {
  const { rows } = await db.query(
    "UPDATE users SET selected_template_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, selected_template_id;",
    [selected_template_id || null, id]
  );
  return rows[0];
};
