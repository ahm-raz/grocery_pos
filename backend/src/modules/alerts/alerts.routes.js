import express from 'express';
import { getExpiring, getAlerts } from './alerts.controller.js';
import authenticate from '../../middleware/auth.js';
import { validateStoreAccess } from '../../middleware/storeScope.js';

const router = express.Router();

// All alert routes require authentication and store scoping
router.use(authenticate);
router.use(validateStoreAccess);

router.get('/expiring', getExpiring);
router.get('/inventory', getAlerts);

export default router;

