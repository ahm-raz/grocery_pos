import express from 'express';
import { getProducts, searchProductsHandler } from '../products/products.pos.controller.js';
import { addItem, updateItem, removeItem, getCartHandler } from './cart.controller.js';
import { checkout } from '../orders/orders.controller.js';
import authenticate from '../../middleware/auth.js';
import { validateStoreAccess } from '../../middleware/storeScope.js';

const router = express.Router();

// All POS routes require authentication and store scoping
router.use(authenticate);
router.use(validateStoreAccess);

// Product availability endpoints
router.get('/products', getProducts);
router.get('/products/search', searchProductsHandler);

// Cart endpoints
router.get('/cart', getCartHandler);
router.post('/cart/add', addItem);
router.put('/cart/update', updateItem);
router.delete('/cart/remove', removeItem);

// Checkout endpoint
router.post('/checkout', checkout);

export default router;

