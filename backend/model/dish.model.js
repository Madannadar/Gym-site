import db from "../config/db.js";

export const insertDishModel = async (dishData, client = db) => {
  const {
    created_by,
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units,
    meal_type,
    is_vegetarian,
    unit_value,
  } = dishData;

  const query = `
    INSERT INTO diet_dishes (
      created_by, dish_name, calories, protein, fat, carbs,
      units, meal_type, is_vegetarian, unit_value
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [
    created_by || null,
    dish_name,
    calories || 0,
    protein || 0,
    fat || 0,
    carbs || 0,
    units ? `{${units}}` : null,
    meal_type || null,
    is_vegetarian || false,
    unit_value || null,
  ];

  const result = await client.query(query, values);
  return result.rows[0];
};

export const getAllDishesModel = async () => {
  const result = await db.query(
    "SELECT * FROM diet_dishes ORDER BY created_at DESC"
  );
  return result.rows;
};

export const getDishByIdModel = async (id) => {
  const result = await db.query(
    "SELECT * FROM diet_dishes WHERE dish_id = $1",
    [id]
  );
  return result.rows[0];
};

export const getDishByNameModel = async (name) => {
  const result = await db.query(
    "SELECT * FROM diet_dishes WHERE dish_name = $1",
    [name]
  );
  return result.rows[0];
};

export const updateDishModel = async (id, dishData) => {
  const {
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units,
    meal_type,
    is_vegetarian,
    unit_value,
  } = dishData;

  const query = `
    UPDATE diet_dishes
    SET
      dish_name = COALESCE($1, dish_name),
      calories = COALESCE($2, calories),
      protein = COALESCE($3, protein),
      fat = COALESCE($4, fat),
      carbs = COALESCE($5, carbs),
      units = COALESCE($6, units),
      meal_type = COALESCE($7, meal_type),
      is_vegetarian = COALESCE($8, is_vegetarian),
      unit_value = COALESCE($9, unit_value)
    WHERE dish_id = $10
    RETURNING *;
  `;

  const values = [
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units ? `{${units}}` : null,
    meal_type,
    is_vegetarian,
    unit_value,
    id,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

export const deleteDishModel = async (id) => {
  const result = await db.query(
    "DELETE FROM diet_dishes WHERE dish_id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const getDishByUserIdModel = async (userId) => {
  const result = await db.query(
    "SELECT * FROM diet_dishes WHERE created_by = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
};

export const deleteAllDishCreatedByUserIdModel = async (userId) => {
  const result = await db.query(
    "DELETE FROM diet_dishes WHERE created_by = $1 RETURNING *",
    [userId]
  );
  return result.rows;
};
