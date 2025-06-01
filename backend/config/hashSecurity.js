const security = {
  saltRounds: 12,
  passwordResetTokenExpiry: 600000, // 10 mins
  emailVerificationTokenExpiry: 3600000, // 1 hours
};

export default security;
