import express from "express";
import passport from "passport";
import * as authController from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
  validateResetPassword,
} from "../validation/auth.validation.js";

const router = express.Router();

router.post("/register", validateRegister, authController.registerUser);
router.post("/login", validateLogin, authController.loginUser);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/logout", authController.logoutUser);
router.post("/verify-email", authController.verifyUserEmail);
router.post("/request-password-reset", authController.requestPasswordResetLink);
router.post(
  "/reset-password",
  validateResetPassword,
  authController.resetUserPassword,
);
router.get("/validate-tokens", authController.validateTokens);

// Google SSO routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: true }),
  authController.googleLogin,
);

export default router;
