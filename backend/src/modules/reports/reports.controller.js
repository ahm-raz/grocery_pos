import { getSalesSummary, getInventoryReport, getTransactionHistory, getPaymentsReport } from './reports.service.js';
import { getStoreIdForQuery } from '../../middleware/storeScope.js';

const getSales = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const storeId = getStoreIdForQuery(req);
    const salesData = await getSalesSummary(startDate, endDate, storeId, limit ? parseInt(limit) : 30);
    res.status(200).json(salesData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getInventory = async (req, res) => {
  try {
    const { limit } = req.query;
    const storeId = getStoreIdForQuery(req);
    const inventoryData = await getInventoryReport(storeId, limit ? parseInt(limit) : 100);
    res.status(200).json(inventoryData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { productId, startDate, endDate, reason, limit } = req.query;
    const storeId = getStoreIdForQuery(req);
    const transactions = await getTransactionHistory(productId, startDate, endDate, reason, storeId, limit ? parseInt(limit) : 100);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const storeId = getStoreIdForQuery(req);
    const paymentsData = await getPaymentsReport(startDate, endDate, storeId);
    res.status(200).json(paymentsData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { getSales, getInventory, getTransactions, getPayments };

