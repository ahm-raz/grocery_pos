import express from 'express';
import { createCategory, getCategory, getCategories, updateCategory, deleteCategory } from './categories.controller.js';
import authenticate from '../../middleware/auth.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Public read access
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected write access (ADMIN, MANAGER only)
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

export default router;

