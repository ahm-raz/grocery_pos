import express from 'express';
import { createInventory, getInventory, getInventories, adjustStock, getHistory, getLowStock } from './inventory.controller.js';
import authenticate from '../../middleware/auth.js';
import { validateStoreAccess } from '../../middleware/storeScope.js';

const router = express.Router();

// All inventory routes require authentication and store scoping
router.use(authenticate);
router.use(validateStoreAccess);

router.post('/', createInventory);
router.get('/', getInventories);
router.get('/low-stock', getLowStock);
router.post('/adjust', adjustStock);
router.get('/:productId/history', getHistory);
router.get('/:id', getInventory);

export default router;

