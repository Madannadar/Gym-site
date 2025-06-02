import { body } from "express-validator";

export const validateUpdateProfile = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .trim()
    .escape(),

  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .trim()
    .escape(),
];
