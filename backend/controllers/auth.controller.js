import * as userModel from "../models/user.model.js";
import * as tokenModel from "../models/token.model.js";
import * as tokenService from "../services/token.service.js";
import * as emailService from "../services/email.service.js";
import * as passwordUtils from "../utils/password.utils.js";
import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: "Email already in use",
    });
  }

  const user = await userModel.create({ email, password, firstName, lastName });
  const verificationToken = await tokenModel.createEmailVerificationToken(
    user.id,
  );
  await emailService.sendVerificationEmail(email, verificationToken);

  res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  const isValid = await passwordUtils.verifyPassword(
    password,
    user.password_hash,
    user.salt,
  );
  if (!isValid) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  if (!user.is_verified) {
    return res
      .status(403)
      .json({ success: false, error: "Email not verified" });
  }

  const { accessToken, refreshToken } =
    await tokenService.issueTokenPairForUser(user);

  res.json({
    success: true,
    accessToken,
    refreshToken,
    expiresIn: 900,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    },
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: "Refresh token is required",
    });
  }

  try {
    const accessToken =
      await tokenService.getNewAccessTokenUsingRefreshToken(refreshToken);
    res.json({ success: true, accessToken });
  } catch (err) {
    res
      .status(403)
      .json({ success: false, error: "Invalid or expired refresh token" });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: "Refresh token is required",
    });
  }

  await tokenService.revokeSingleRefreshToken(refreshToken);
  res.json({ success: true, message: "Logged out successfully" });
});

const verifyUserEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const verificationToken = await tokenModel.findEmailVerificationToken(token);
  if (!verificationToken) {
    return res.status(400).json({
      success: false,
      error: "Invalid or expired verification token",
    });
  }

  await userModel.verifyEmail(verificationToken.user_id);
  await tokenModel.deleteEmailVerificationToken(verificationToken.id);

  res.json({ success: true, message: "Email verified successfully" });
});

const requestPasswordResetLink = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const resetToken = await tokenModel.createPasswordResetToken(user.id);
  await emailService.sendPasswordResetEmail(email, resetToken);

  res.json({
    success: true,
    message: "Password reset link sent to your email",
  });
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const resetToken = await tokenModel.findPasswordResetToken(token);
  if (!resetToken) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid or expired reset token" });
  }

  await userModel.updatePassword(resetToken.user_id, newPassword);
  await tokenModel.markPasswordResetTokenAsUsed(resetToken.id);
  await tokenModel.revokeAllRefreshTokens(resetToken.user_id);

  res.json({ success: true, message: "Password reset successfully" });
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyUserEmail,
  requestPasswordResetLink,
  resetUserPassword,
};
