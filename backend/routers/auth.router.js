import express from "express";
import authController from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
  validateResetPassword,
} from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post(
  "/reset-password",
  validateResetPassword,
  authController.resetPassword,
);

export default router;
