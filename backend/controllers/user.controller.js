import {
  updateName,
  updateVegetarian,
  updateSelectedTemplateModel,
} from "../model/user.model.js";
import db from "../config/db.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId); // Changed to userId
    if (isNaN(userId)) {
      console.error("❌ Invalid userId in token");
      return res.status(401).json({ error: "Invalid token payload" });
    }
    console.log(`🔍 Fetching user with ID: ${userId}`);
    const result = await db.query(
      "SELECT id, email, first_name, last_name, is_vegetarian, selected_template_id FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      console.error(`❌ User not found for ID: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }
    console.log(`✅ User found: ${result.rows[0].email}`);
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("❌ Get Current User Error:", err.stack);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const handleUpdateName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = await updateName(id, name);
    res.json({ user });
  } catch (err) {
    console.error("❌ Update Name Error:", err.stack);
    res.status(500).json({ error: "Failed to update name" });
  }
};

export const handleUpdateVegetarian = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_vegetarian } = req.body;
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = await updateVegetarian(id, is_vegetarian);
    res.json({ user });
  } catch (err) {
    console.error("❌ Update Vegetarian Error:", err.stack);
    res.status(500).json({ error: "Failed to update vegetarian preference" });
  }
};

export const updateSelectedTemplate = async (req, res) => {
  const { id } = req.params;
  const { selected_template_id } = req.body;

  try {
    const authUserId = parseInt(req.user.userId); // Changed to userId
    if (isNaN(authUserId) || authUserId !== parseInt(id)) {
      console.error("❌ Unauthorized or invalid userId");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [id]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (selected_template_id) {
      const templateCheck = await db.query(
        "SELECT template_id FROM diet_templates WHERE template_id = $1",
        [selected_template_id]
      );
      if (templateCheck.rows.length === 0) {
        return res.status(400).json({ error: "Invalid template ID" });
      }
    }

    const user = await updateSelectedTemplateModel(id, selected_template_id);
    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ Failed to update selected template:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
