import db from "../config/db.js";

export const getQRForToday = async () => {
  const result = await db.query(
    `SELECT * FROM daily_qr_codes WHERE valid_for = CURRENT_DATE`
  );
  return result.rows[0];
};

export const createQRForToday = async (qr_code) => {
  const result = await db.query(
    `
    INSERT INTO daily_qr_codes (qr_code, valid_for)
    VALUES ($1, CURRENT_DATE)
    RETURNING *;
    `,
    [qr_code]
  );
  return result.rows[0];
};
