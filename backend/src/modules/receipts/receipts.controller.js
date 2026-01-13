import Order from '../../models/Order.js';
import { generateReceiptHTML } from './receipts.service.js';

const getReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const storeId = req.userStoreId;
    const userId = req.user._id;

    const query = { _id: orderId };
    if (req.user.role !== 'ADMIN') {
      query.store = storeId;
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('items.product', 'sku name unitType price')
      .populate('store', 'name storeCode address')
      .populate('user', 'name');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const receiptHTML = generateReceiptHTML(order, order.store, order.user);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(receiptHTML);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { getReceipt };

