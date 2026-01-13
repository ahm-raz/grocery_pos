import express from 'express';
import { getSales, getInventory, getTransactions, getPayments } from './reports.controller.js';
import authenticate from '../../middleware/auth.js';
import { validateStoreAccess } from '../../middleware/storeScope.js';

const router = express.Router();

// All report routes require authentication and store scoping
router.use(authenticate);
router.use(validateStoreAccess);

router.get('/sales', getSales);
router.get('/inventory', getInventory);
router.get('/transactions', getTransactions);
router.get('/payments', getPayments);

export default router;

