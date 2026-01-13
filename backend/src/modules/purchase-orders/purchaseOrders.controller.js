import { createPurchaseOrder, receivePurchaseOrder, getPurchaseOrders, getPurchaseOrderById, cancelPurchaseOrder } from './purchaseOrders.service.js';
import { getStoreIdForQuery } from '../../middleware/storeScope.js';

const createPO = async (req, res) => {
  try {
    const { supplierName, items } = req.body;
    
    // Get storeId - prefer body, then userStoreId from middleware, then user's store
    let storeId = req.body.storeId;
    
    if (!storeId && req.userStoreId) {
      storeId = req.userStoreId;
    } else if (!storeId && req.user?.store) {
      storeId = req.user.store._id ? req.user.store._id.toString() : req.user.store.toString();
    }

    if (!supplierName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: supplierName, items' });
    }

    if (!storeId) {
      return res.status(400).json({ 
        error: 'Store ID is required. Please ensure you are assigned to a store.',
        userRole: req.user?.role,
        hasStore: !!req.user?.store,
        userStoreId: req.userStoreId
      });
    }

    // Validate store access (for non-admin users)
    if (req.user.role !== 'ADMIN' && req.userStoreId && storeId.toString() !== req.userStoreId.toString()) {
      return res.status(403).json({ error: 'Access denied. Cannot create PO for other stores.' });
    }

    const purchaseOrder = await createPurchaseOrder(storeId, supplierName, items);
    res.status(201).json(purchaseOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const receivePO = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.body.storeId || req.userStoreId;

    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && storeId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot receive PO for other stores.' });
    }

    const purchaseOrder = await receivePurchaseOrder(id, storeId);
    res.status(200).json(purchaseOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPOs = async (req, res) => {
  try {
    const { status } = req.query;
    const storeId = getStoreIdForQuery(req);
    const purchaseOrders = await getPurchaseOrders(storeId, status);
    res.status(200).json(purchaseOrders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPOById = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = getStoreIdForQuery(req);
    const purchaseOrder = await getPurchaseOrderById(id, storeId);
    res.status(200).json(purchaseOrder);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const cancelPO = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.body.storeId || req.userStoreId;

    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && storeId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot cancel PO for other stores.' });
    }

    const purchaseOrder = await cancelPurchaseOrder(id, storeId);
    res.status(200).json(purchaseOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { createPO, receivePO, getPOs, getPOById, cancelPO };

