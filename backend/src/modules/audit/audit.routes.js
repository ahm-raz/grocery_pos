import express from 'express';
import { getAuditLogs } from './audit.controller.js';
import authenticate from '../../middleware/auth.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Audit logs are ADMIN only
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getAuditLogs);

export default router;

