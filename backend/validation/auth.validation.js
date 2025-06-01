import { body } from "express-validator";

const passwordValidationRules = (field = "password") => [
  body(field)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character"),
];

export const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .bail()
    .normalizeEmail(),

  ...passwordValidationRules(),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .customSanitizer((value) => value.replace(/[^a-zA-Z\s'-]/g, "")),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .trim()
    .customSanitizer((value) => value.replace(/[^a-zA-Z\s'-]/g, "")),
];

export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .bail()
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

export const validateResetPassword = [
  body("token").notEmpty().withMessage("Token is required"),

  ...passwordValidationRules("newPassword"),
];
