import db from '../config/db.js';
import * as passwordUtils from '../utils/password.util.js';

async function createUser({ email, password, firstName, lastName, googleId }) {
  const { hash, salt } = password
    ? await passwordUtils.generatePasswordHash(password)
    : { hash: '', salt: '' };

  const result = await db.query(
    `INSERT INTO users (email, password_hash, salt, first_name, last_name, google_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, first_name, last_name, is_verified, created_at`,
    [email, hash, salt, firstName, lastName, googleId || null],
  );

  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function getUserById(userId) {
  const result = await db.query(
    'SELECT id, email, first_name, last_name, is_verified FROM users WHERE id = $1',
    [userId],
  );
  return result.rows[0];
}

async function markUserEmailVerified(userId) {
  const result = await db.query(
    `UPDATE users
     SET is_verified = true
     WHERE id = $1
     RETURNING id, email, first_name, last_name, is_verified`,
    [userId],
  );
  return result.rows[0];
}

async function updateUserPassword(userId, newPassword) {
  const { hash, salt } = await passwordUtils.generatePasswordHash(newPassword);

  const result = await db.query(
    `UPDATE users
     SET password_hash = $1, salt = $2
     WHERE id = $3
     RETURNING id`,
    [hash, salt, userId],
  );
  return result.rows[0];
}

async function deleteUserById(userId) {
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}

export {
  createUser,
  getUserByEmail,
  getUserById,
  markUserEmailVerified,
  updateUserPassword,
  deleteUserById,
};
