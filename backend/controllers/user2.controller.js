const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  res.json({
    success: true,
    user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;

  const user = await userModel.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  // In a real app, you would have a proper update method in the model
  const updatedUser = await userModel.updateProfile(
    req.user.userId,
    firstName,
    lastName,
  );

  res.json({
    success: true,
    user: updatedUser,
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await userModel.findByEmail(req.user.email);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  // Verify password
  const isValid = await passwordUtils.verifyPassword(
    password,
    user.password_hash,
    user.salt,
  );

  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: "Invalid password",
    });
  }

  // Delete user
  await userModel.delete(req.user.userId);

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
};
