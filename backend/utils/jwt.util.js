import jwt from "jsonwebtoken";
import config from "../config/jwt.js";

function generateAccessToken(payload) {
  return jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.tokenExpiry,
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.tokenExpiry,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.accessTokenSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshTokenSecret);
}

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
