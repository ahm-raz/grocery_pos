import express from 'express';
import { createUserHandler, getUsersHandler, getUserByIdHandler, updateUserHandler, deleteUserHandler, activateUserHandler, permanentDeleteUserHandler } from './users.controller.js';
import authenticate from '../../middleware/auth.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Create user - Admin only
router.post('/', authorize('ADMIN'), createUserHandler);

// List users - Admin and Manager
router.get('/', authorize('ADMIN', 'MANAGER'), getUsersHandler);

// Activate user - Admin only (must come before /:id route)
router.put('/:id/activate', authorize('ADMIN'), activateUserHandler);

// Permanent delete user - Admin only (must come before /:id route)
router.delete('/:id/permanent', authorize('ADMIN'), permanentDeleteUserHandler);

// Get user by ID - Admin and Manager
router.get('/:id', authorize('ADMIN', 'MANAGER'), getUserByIdHandler);

// Update user - Admin only
router.put('/:id', authorize('ADMIN'), updateUserHandler);

// Delete (deactivate) user - Admin only
router.delete('/:id', authorize('ADMIN'), deleteUserHandler);

export default router;

