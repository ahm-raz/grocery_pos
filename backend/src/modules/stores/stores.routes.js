import express from 'express';
import { createStore, getStore, getStores } from './stores.controller.js';

const router = express.Router();

router.post('/', createStore);
router.get('/', getStores);
router.get('/:id', getStore);

export default router;

