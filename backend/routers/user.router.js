import express from "express";
import {
  recordUserAccount,
  fetchAllUsers,
  fetchUserById,
  updateUserNameById,
  updateUserVegetarianById,
  updateUserPasswordById,
  updateUserSubscriptionById,
  deleteUserById,
} from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/users - create a new user
router.post("/", recordUserAccount);

// GET /api/users - fetch all users
router.get("/", fetchAllUsers);

// GET /api/users/:user_id - fetch a user by ID
router.get("/:user_id", fetchUserById);

// PUT /api/users/:user_id/name - update user name
router.put("/:user_id/name", updateUserNameById);

// PUT /api/users/:user_id/vegetarian - update vegetarian preference
router.put("/:user_id/vegetarian", updateUserVegetarianById);

// PUT /api/users/:user_id/password - update user password
router.put("/:user_id/password", updateUserPasswordById);

// PUT /api/users/:user_id/subscription - update user subscription
router.put("/:user_id/subscription", updateUserSubscriptionById);

// DELETE /api/users/:user_id - delete a user
router.delete("/:user_id", deleteUserById);

export default router;
