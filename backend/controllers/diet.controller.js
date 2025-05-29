import db from "../config/db.js";

export const createDish = async (req, res) => {
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
  } = req.body;

  if (!dish_name || !meal_type) {
    return res.status(400).json({ error: "dish_name and meal_type are required." });
  }

  const query = `
    INSERT INTO diet_dishes (
      created_by, dish_name, calories, protein, fat, carbs,
      units, meal_type, is_vegetarian
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    created_by || null,
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units || null,
    meal_type,
    is_vegetarian,
  ];

  try {
    const result = await db.query(query, values);
    return res.status(201).json({ dish: result.rows[0] });
  } catch (err) {
    console.error("❌ Failed to insert dish:", err.stack);
    return res.status(500).json({ error: "Failed to insert dish." });
  }
};
