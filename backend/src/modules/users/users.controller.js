import { createUser, getUsers, getUserById, updateUser, deleteUser, activateUser, permanentDeleteUser } from './users.service.js';
import { logAudit, getAuditContext } from '../audit/audit.service.js';

const createUserHandler = async (req, res) => {
  try {
    const { name, email, password, role, store } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const auditContext = getAuditContext(req);
    const user = await createUser({ name, email, password, role, store });
    
    // Audit log user creation
    logAudit({
      ...auditContext,
      user: req.user._id,
      store: store || req.userStoreId,
      action: 'USER_CREATE',
      entityType: 'USER',
      entityId: user._id.toString(),
      after: { name: user.name, email: user.email, role: user.role, store: user.store },
      severity: 'MEDIUM'
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUsersHandler = async (req, res) => {
  try {
    // Non-admin users can only see users from their store
    const storeId = req.user.role === 'ADMIN' ? req.query.storeId : req.userStoreId;
    // Include inactive users if requested (only for ADMIN)
    const includeInactive = req.user.role === 'ADMIN' && req.query.includeInactive === 'true';
    const users = await getUsers(storeId, includeInactive);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating password hash directly
    if (updateData.passwordHash) {
      delete updateData.passwordHash;
    }

    // Get before state for audit
    const beforeUser = await getUserById(id);
    const auditContext = getAuditContext(req);
    
    const user = await updateUser(id, updateData);
    
    // Determine action type
    let action = 'USER_UPDATE';
    if (updateData.role && updateData.role !== beforeUser.role) {
      action = 'USER_ROLE_CHANGE';
    }

    // Audit log user update
    logAudit({
      ...auditContext,
      user: req.user._id,
      store: user.store || req.userStoreId,
      action,
      entityType: 'USER',
      entityId: user._id.toString(),
      before: { role: beforeUser.role, isActive: beforeUser.isActive },
      after: { role: user.role, isActive: user.isActive },
      severity: action === 'USER_ROLE_CHANGE' ? 'HIGH' : 'MEDIUM'
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get before state for audit
    const beforeUser = await getUserById(id);
    const auditContext = getAuditContext(req);
    
    const user = await deleteUser(id);
    
    // Audit log user deactivation
    logAudit({
      ...auditContext,
      user: req.user._id,
      store: user.store || req.userStoreId,
      action: 'USER_DEACTIVATE',
      entityType: 'USER',
      entityId: user._id.toString(),
      before: { isActive: beforeUser.isActive },
      after: { isActive: user.isActive },
      severity: 'MEDIUM'
    });

    res.status(200).json({ message: 'User deactivated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const activateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get before state for audit
    const beforeUser = await getUserById(id);
    const auditContext = getAuditContext(req);
    
    const user = await activateUser(id);
    
    // Audit log user activation
    logAudit({
      ...auditContext,
      user: req.user._id,
      store: user.store || req.userStoreId,
      action: 'USER_ACTIVATE',
      entityType: 'USER',
      entityId: user._id.toString(),
      before: { isActive: beforeUser.isActive },
      after: { isActive: user.isActive },
      severity: 'MEDIUM'
    });

    res.status(200).json({ message: 'User activated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const permanentDeleteUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get before state for audit
    const beforeUser = await getUserById(id);
    const auditContext = getAuditContext(req);
    
    const result = await permanentDeleteUser(id);
    
    // Audit log permanent deletion
    logAudit({
      ...auditContext,
      user: req.user._id,
      store: beforeUser.store || req.userStoreId,
      action: 'USER_PERMANENT_DELETE',
      entityType: 'USER',
      entityId: id,
      before: { name: beforeUser.name, email: beforeUser.email, role: beforeUser.role },
      after: { deleted: true },
      severity: 'HIGH'
    });

    res.status(200).json({ message: 'User permanently deleted', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { createUserHandler, getUsersHandler, getUserByIdHandler, updateUserHandler, deleteUserHandler, activateUserHandler, permanentDeleteUserHandler };

