import { Router } from "express";
import {
  handleCreateUser,
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateName,
  handleUpdateVegetarian,
  handleUpdatePassword,
  handleUpdateSubscription,
  handleDeleteUser,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/users", handleCreateUser);
router.get("/users", handleGetAllUsers);
router.get("/users/:user_id", handleGetUserById);

router.put("/users/:user_id/name", handleUpdateName);
router.put("/users/:user_id/vegetarian", handleUpdateVegetarian);
router.put("/users/:user_id/password", handleUpdatePassword);
router.put("/users/:user_id/subscription", handleUpdateSubscription);

router.delete("/users/:user_id", handleDeleteUser);

export default router;
