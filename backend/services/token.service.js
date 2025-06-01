import * as jwtUtils from "../utils/jwt.util.js";
import * as tokenModel from "../model/token.model.js";
import * as userModel from "../model/user.model.js";

/**
 * Issues both access and refresh tokens for a given user.
 * Stores the refresh token in the database.
 */
async function issueTokenPairForUser(user) {
  const accessToken = jwtUtils.generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = jwtUtils.generateRefreshToken({
    userId: user.id,
  });

  await tokenModel.createRefreshToken(
    user.id,
    refreshToken,
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  );

  return { accessToken, refreshToken };
}

/**
 * Validates a refresh token and returns a new access token if valid.
 */
async function getNewAccessTokenUsingRefreshToken(refreshToken) {
  const dbToken = await tokenModel.findRefreshToken(refreshToken);
  if (!dbToken) {
    throw new Error("Invalid refresh token");
  }

  const decoded = jwtUtils.verifyRefreshToken(refreshToken);
  const user = await userModel.findById(decoded.userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newAccessToken = jwtUtils.generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return newAccessToken;
}

/**
 * Marks a given refresh token as revoked in the database.
 */
async function revokeSingleRefreshToken(token) {
  await tokenModel.revokeRefreshTokenByToken(token);
}

export {
  issueTokenPairForUser,
  getNewAccessTokenUsingRefreshToken,
  revokeSingleRefreshToken,
};
