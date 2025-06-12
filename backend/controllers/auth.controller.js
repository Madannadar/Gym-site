import * as userModel from "../model/user.model.js";
import * as tokenModel from "../model/token.model.js";
import * as authModel from "../model/auth.model.js";
import * as tokenService from "../services/token.service.js";
import * as emailService from "../services/email.service.js";
import * as passwordUtils from "../utils/password.util.js";

const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await authModel.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: "Email already in use" });
    }

    const user = await authModel.createUser({
      email,
      password,
      firstName,
      lastName,
    });
    const verificationToken = await tokenModel.generateEmailVerificationToken(
      user.id,
    );
    await emailService.sendVerificationEmail(email, verificationToken);

    const { accessToken, refreshToken } =
      await tokenService.issueTokenPairForUser(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 180,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authModel.getUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const isValid = await passwordUtils.isPasswordValid(
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, error: "Refresh token is required" });
    }

    const accessToken =
      await tokenService.getNewAccessTokenUsingRefreshToken(refreshToken);
    res.json({ success: true, accessToken });
  } catch (error) {
    console.log(error);
    res
      .status(403)
      .json({ success: false, error: "Invalid or expired refresh token" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, error: "Refresh token is required" });
    }

    await tokenService.revokeSingleRefreshToken(refreshToken);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Logout failed" });
  }
};

const verifyUserEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const verificationToken = await tokenModel.getEmailVerificationToken(token);
    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification token",
      });
    }

    await authModel.markUserEmailVerified(verificationToken.user_id);
    await tokenModel.deleteEmailVerificationTokenById(verificationToken.id);

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Email verification failed" });
  }
};

const requestPasswordResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await authModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const resetToken = await tokenModel.generatePasswordResetToken(user.id);
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to request password reset" });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await tokenModel.getValidPasswordResetToken(token);
    if (!resetToken) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired reset token" });
    }

    await authModel.updateUserPassword(resetToken.user_id, newPassword);
    await tokenModel.markPasswordResetTokenUsed(resetToken.id);
    await tokenModel.revokeAllRefreshTokensForUser(resetToken.user_id);

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Failed to reset password" });
  }
};

const googleLogin = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Google login failed" });
    }
    const { accessToken, refreshToken } =
      await tokenService.issueTokenPairForUser(req.user);
    res.json({
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Google login failed" });
  }
};

const validateTokens = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Access token required" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = await tokenService.verifyAccessToken(token);
    const user = await authModel.getUserById(decoded.userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid token" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyUserEmail,
  requestPasswordResetLink,
  resetUserPassword,
  googleLogin,
  validateTokens,
};
