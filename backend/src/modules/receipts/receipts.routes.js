import express from 'express';
import { getReceipt } from './receipts.controller.js';
import authenticate from '../../middleware/auth.js';
import { validateStoreAccess } from '../../middleware/storeScope.js';

const router = express.Router();

// All receipt routes require authentication and store scoping
router.use(authenticate);
router.use(validateStoreAccess);

router.get('/:orderId', getReceipt);

export default router;

