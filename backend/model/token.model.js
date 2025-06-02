import db from "../config/db.js";
import crypto from "crypto";

async function createRefreshToken(userId, token, expiresAt) {
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  );
}

async function getValidRefreshToken(token) {
  const result = await db.query(
    `SELECT * FROM refresh_tokens
     WHERE token = $1 AND revoked = false AND expires_at > NOW()`,
    [token],
  );
  return result.rows[0];
}

async function revokeRefreshTokenByToken(token) {
  await db.query("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [
    token,
  ]);
}

async function revokeAllRefreshTokensForUser(userId) {
  await db.query(
    "UPDATE refresh_tokens SET revoked = true WHERE user_id = $1",
    [userId],
  );
}

async function generatePasswordResetToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  await db.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  );

  return token;
}

async function getValidPasswordResetToken(token) {
  const result = await db.query(
    `SELECT * FROM password_reset_tokens
     WHERE token = $1 AND used = false AND expires_at > NOW()`,
    [token],
  );
  return result.rows[0];
}

async function markPasswordResetTokenUsed(tokenId) {
  await db.query("UPDATE password_reset_tokens SET used = true WHERE id = $1", [
    tokenId,
  ]);
}

async function generateEmailVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 86400000); // 24 hours

  await db.query(
    `INSERT INTO email_verification_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  );

  return token;
}

async function getEmailVerificationToken(token) {
  const result = await db.query(
    `SELECT * FROM email_verification_tokens
     WHERE token = $1 AND expires_at > NOW()`,
    [token],
  );
  return result.rows[0];
}

async function deleteEmailVerificationTokenById(tokenId) {
  await db.query("DELETE FROM email_verification_tokens WHERE id = $1", [
    tokenId,
  ]);
}

export {
  createRefreshToken,
  getValidRefreshToken,
  revokeRefreshTokenByToken,
  revokeAllRefreshTokensForUser,
  generatePasswordResetToken,
  getValidPasswordResetToken,
  markPasswordResetTokenUsed,
  generateEmailVerificationToken,
  getEmailVerificationToken,
  deleteEmailVerificationTokenById,
};
