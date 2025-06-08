import { Router } from "express";
import {
  handleUpdateName,
  handleUpdateVegetarian,
  handleUpdateSubscription,
} from "../controllers/user.controller.js";

const router = Router();

//all works

router.put("/:user_id/name", handleUpdateName);
router.put("/:user_id/vegetarian", handleUpdateVegetarian);
router.put("/:user_id/subscription", handleUpdateSubscription);

export default router;

/*

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateUpdateProfile } = require('../validations/user.validation');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateUpdateProfile, userController.updateProfile);
router.delete('/account', authenticate, userController.deleteAccount);

module.exports = router;
*/
