import express from 'express';
import { createPO, receivePO, getPOs, getPOById, cancelPO } from './purchaseOrders.controller.js';
import authenticate from '../../middleware/auth.js';
import { validateStoreAccess } from '../../middleware/storeScope.js';

const router = express.Router();

// All purchase order routes require authentication and store scoping
router.use(authenticate);
router.use(validateStoreAccess);

router.post('/', createPO);
router.get('/', getPOs);
router.get('/:id', getPOById);
router.put('/:id/receive', receivePO);
router.put('/:id/cancel', cancelPO);

export default router;

