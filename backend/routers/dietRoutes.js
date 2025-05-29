import express from "express";
import { createDish } from "../controllers/diet.controller.js";

const router = express.Router();

router.post("/addDish", createDish);

export default router;
