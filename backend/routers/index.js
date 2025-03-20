import express from 'express';
import { getSampleData } from '../controllers/sampleController.js';

const router = express.Router();

// Sample route
router.get('/sample', getSampleData);

export default router;
