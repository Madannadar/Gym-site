import { Router } from "express";
import {
  handleUpdateName,
  handleUpdateVegetarian,
  // handleUpdateSubscription,
  updateSelectedTemplate,
  getCurrentUser,
} from "../controllers/user.controller.js";
import authenticate from "../middlewares/authenticate.middleware.js";

const router = Router();

router.get("/me", authenticate, getCurrentUser);
router.put("/:id/name", authenticate, handleUpdateName);
router.put("/:id/vegetarian", authenticate, handleUpdateVegetarian);
// router.put("/:id/subscription", authenticate, handleUpdateSubscription);
router.put("/:id/template", authenticate, updateSelectedTemplate);

export default router;
