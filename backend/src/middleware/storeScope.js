// Middleware to enforce store scoping
// ADMIN can access any store, others restricted to their assigned store

const validateStoreAccess = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ADMIN can access any store
  if (user.role === 'ADMIN') {
    // For ADMIN, set userStoreId if they have a store, otherwise allow them to specify storeId in request
    if (user.store) {
      req.userStoreId = user.store._id ? user.store._id.toString() : user.store.toString();
    } else {
      // ADMIN without store can specify storeId in request
      const requestedStoreId = req.query.storeId || req.params.storeId || req.body.storeId;
      req.userStoreId = requestedStoreId ? requestedStoreId.toString() : null;
    }
    return next();
  }

  // Non-admin users must have a store assignment
  if (!user.store) {
    return res.status(403).json({ error: 'User must be assigned to a store' });
  }

  // Get storeId from request (query, params, or body)
  const requestedStoreId = req.query.storeId || req.params.storeId || req.body.storeId;
  
  // If storeId is provided, validate it matches user's store
  if (requestedStoreId) {
    const userStoreId = user.store._id ? user.store._id.toString() : user.store.toString();
    const requestedStoreIdStr = requestedStoreId.toString();
    
    if (userStoreId !== requestedStoreIdStr) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access data from your assigned store.',
        userStore: userStoreId,
        requestedStore: requestedStoreIdStr
      });
    }
  }

  // Attach user's store ID to request for service layer
  req.userStoreId = user.store._id ? user.store._id.toString() : user.store.toString();
  next();
};

// Helper to get store ID for queries (returns user's store or requested store if ADMIN)
const getStoreIdForQuery = (req) => {
  const user = req.user;
  
  // ADMIN can specify any store
  if (user.role === 'ADMIN') {
    return req.query.storeId || req.params.storeId || req.body.storeId || null;
  }
  
  // Non-admin users restricted to their store
  return user.store ? (user.store._id ? user.store._id.toString() : user.store.toString()) : null;
};

export { validateStoreAccess, getStoreIdForQuery };

