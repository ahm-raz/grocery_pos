import express from 'express';
import { createProduct, getProduct, getProducts, updateProduct, deleteProduct } from './products.controller.js';
import authenticate from '../../middleware/auth.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Public read access
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected write access (ADMIN, MANAGER only)
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;

