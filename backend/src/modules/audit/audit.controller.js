import AuditLog from '../../models/AuditLog.js';
import mongoose from 'mongoose';

const getAuditLogs = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      userId, 
      storeId, 
      action, 
      entityType,
      severity,
      page = 1, 
      limit = 50 
    } = req.query;

    // Validate limit (max 200)
    const queryLimit = Math.min(parseInt(limit) || 50, 200);
    const queryPage = Math.max(parseInt(page) || 1, 1);
    const skip = (queryPage - 1) * queryLimit;

    // Build query
    const query = {};

    // Date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // User filter
    if (userId) {
      query.user = new mongoose.Types.ObjectId(userId);
    }

    // Store filter (ADMIN can see all, others only their store)
    if (storeId) {
      query.store = new mongoose.Types.ObjectId(storeId);
    } else if (req.user.role !== 'ADMIN' && req.userStoreId) {
      query.store = new mongoose.Types.ObjectId(req.userStoreId);
    }

    // Action filter
    if (action) {
      query.action = action;
    }

    // Entity type filter
    if (entityType) {
      query.entityType = entityType;
    }

    // Severity filter
    if (severity) {
      query.severity = severity;
    }

    // Execute query
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'name email role')
        .populate('store', 'name storeCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(queryLimit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      logs,
      pagination: {
        page: queryPage,
        limit: queryLimit,
        total,
        pages: Math.ceil(total / queryLimit)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { getAuditLogs };

