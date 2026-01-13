import Inventory from '../../models/Inventory.js';
import { adjustInventory, getInventoryHistory, getLowStockItems } from './inventory.service.js';
import { getStoreIdForQuery } from '../../middleware/storeScope.js';
import { logAudit, getAuditContext } from '../audit/audit.service.js';

const createInventory = async (req, res) => {
  try {
    // Enforce store scoping - use user's store if not ADMIN
    const storeId = req.body.store || req.userStoreId;
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && storeId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot create inventory for other stores.' });
    }

    const inventory = new Inventory({ ...req.body, store: storeId });
    await inventory.save();
    await inventory.populate('product', 'sku name unitType');
    await inventory.populate('store', 'name storeCode');
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('product', 'sku name unitType')
      .populate('store', 'name storeCode');
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && inventory.store._id.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot access inventory from other stores.' });
    }

    // Add virtual quantity field
    const invObj = inventory.toObject();
    invObj.quantity = inventory.batches.reduce((sum, batch) => sum + batch.quantity, 0);

    res.status(200).json(invObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getInventories = async (req, res) => {
  try {
    const storeId = getStoreIdForQuery(req);
    const query = {};
    if (storeId) {
      query.store = storeId;
    }

    const inventories = await Inventory.find(query)
      .populate('product', 'sku name unitType')
      .populate('store', 'name storeCode')
      .sort({ createdAt: -1 });
    res.status(200).json(inventories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { productId, storeId: requestedStoreId, changeType, quantity, reason, batchNumber, expiryDate } = req.body;

    if (!productId || !requestedStoreId || !changeType || quantity === undefined || !reason) {
      return res.status(400).json({ error: 'Missing required fields: productId, storeId, changeType, quantity, reason' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && requestedStoreId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot adjust inventory for other stores.' });
    }

    // Validate batchNumber for IN operations
    if (changeType === 'IN' && !batchNumber) {
      return res.status(400).json({ error: 'batchNumber is required for stock IN operations' });
    }

    // Get before state for audit
    const beforeInventory = await Inventory.findOne({ product: productId, store: requestedStoreId });
    const beforeQuantity = beforeInventory?.batches?.reduce((sum, b) => sum + b.quantity, 0) || 0;

    const auditContext = getAuditContext(req);
    const updatedInventory = await adjustInventory(productId, requestedStoreId, changeType, quantity, reason, batchNumber, expiryDate);
    
    // Get after state
    const afterQuantity = updatedInventory.batches?.reduce((sum, b) => sum + b.quantity, 0) || 0;

    // INTEGRITY CHECK: Verify batch totals match computed quantity
    const computedQuantity = updatedInventory.batches.reduce((sum, batch) => sum + batch.quantity, 0);
    if (Math.abs(afterQuantity - computedQuantity) > 0.01) {
      logAudit({
        ...auditContext,
        user: req.user._id,
        store: requestedStoreId,
        action: 'INTEGRITY_VIOLATION',
        entityType: 'INVENTORY',
        entityId: productId.toString(),
        severity: 'CRITICAL',
        message: `Inventory batch total mismatch: computed=${computedQuantity}, stored=${afterQuantity}`
      });
    }

    // Audit log inventory adjustment
    logAudit({
      ...auditContext,
      user: req.user._id,
      store: requestedStoreId,
      action: changeType === 'IN' ? 'INVENTORY_BATCH_ADD' : 'INVENTORY_ADJUST',
      entityType: 'INVENTORY',
      entityId: productId.toString(),
      before: { quantity: beforeQuantity },
      after: { quantity: afterQuantity, batchNumber, expiryDate },
      severity: 'MEDIUM'
    });

    res.status(200).json(updatedInventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const storeId = getStoreIdForQuery(req);

    const transactions = await getInventoryHistory(productId, storeId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getLowStock = async (req, res) => {
  try {
    const storeId = getStoreIdForQuery(req);
    const lowStockItems = await getLowStockItems(storeId);
    res.status(200).json(lowStockItems);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { createInventory, getInventory, getInventories, adjustStock, getHistory, getLowStock };

