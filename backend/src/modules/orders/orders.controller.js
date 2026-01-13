import { checkoutCart } from './orders.service.js';
import { getAuditContext } from '../audit/audit.service.js';
import { logAudit } from '../audit/audit.service.js';

const checkout = async (req, res) => {
  try {
    const { storeId: requestedStoreId, payments, tax } = req.body;
    const storeId = requestedStoreId || req.userStoreId;
    const userId = req.user._id;

    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && storeId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot checkout cart from other stores.' });
    }

    // Validate payment info
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ error: 'Payment information is required' });
    }

    const auditContext = getAuditContext(req);
    const order = await checkoutCart(storeId, userId, { payments, tax: tax || 0 }, auditContext);
    res.status(201).json(order);
  } catch (error) {
    // Log integrity violations
    if (error.message.includes('integrity violation') || error.message.includes('mismatch')) {
      logAudit({
        ...getAuditContext(req),
        user: req.user?._id,
        store: req.userStoreId,
        action: 'INTEGRITY_VIOLATION',
        entityType: 'ORDER',
        severity: 'CRITICAL',
        message: error.message
      });
    }
    res.status(400).json({ error: error.message });
  }
};

export { checkout };

