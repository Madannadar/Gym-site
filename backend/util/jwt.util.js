import jwt from "jsonwebtoken";
import config from "../config/index.js";

function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessTokenSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshTokenSecret);
}

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
