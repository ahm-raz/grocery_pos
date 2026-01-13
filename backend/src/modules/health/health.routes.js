import express from 'express';
import { healthCheck, getMetrics } from './health.controller.js';

const router = express.Router();

router.get('/', healthCheck);
router.get('/metrics', getMetrics);

export default router;

