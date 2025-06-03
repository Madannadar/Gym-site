import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a verification email
 */
export async function sendVerificationEmail(email, token) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: `"No Reply" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Email Verification",
    html: `
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Verification email sent:", info.messageId);
  return true;
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"No Reply" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Password reset email sent:", info.messageId);
  return true;
}
