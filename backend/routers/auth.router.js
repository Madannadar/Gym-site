import express from "express";
import * as authController from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
  validateResetPassword,
} from "../validation/auth.validation.js";

const router = express.Router();

router.post("/register", validateRegister, authController.registerUser); //runs
router.post("/login", validateLogin, authController.loginUser); //works
router.post("/refresh-token", authController.refreshAccessToken); //runs
router.post("/logout", authController.logoutUser); //runs
router.get("/verify-email/:token", authController.verifyUserEmail); //runs
router.post("/request-password-reset", authController.requestPasswordResetLink); //rund
router.post(
  "/reset-password",
  validateResetPassword,
  authController.resetUserPassword,
); //rund

export default router;
