import bcrypt from "bcrypt";
import config from "../config/hashSecurity.js";

async function generatePasswordHash(password) {
  const salt = await bcrypt.genSalt(config.saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
}

async function isPasswordValid(password, storedHash, storedSalt) {
  const hashedAttempt = await bcrypt.hash(password, storedSalt);
  return hashedAttempt === storedHash;
}

export { generatePasswordHash, isPasswordValid };
