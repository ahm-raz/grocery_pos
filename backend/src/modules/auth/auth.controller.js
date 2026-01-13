import { login } from './auth.service.js';
import { logAudit, getAuditContext } from '../audit/audit.service.js';
import User from '../../models/User.js';

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const context = getAuditContext(req);
    let user = null;

    try {
      const result = await login(email, password, context.ipAddress, context.userAgent);
      user = result.user;

      // Log successful login
      logAudit({
        ...context,
        user: result.user,
        role: result.user.role,
        store: result.user.store,
        action: 'LOGIN_SUCCESS',
        entityType: 'AUTH',
        entityId: result.user._id.toString(),
        severity: 'LOW'
      });

      res.status(200).json(result);
    } catch (loginError) {
      // Find user for audit logging
      user = await User.findOne({ email }).select('_id role store isActive lockedUntil');

      // Log failed login
      const action = user?.lockedUntil && new Date() < user.lockedUntil 
        ? 'LOGIN_LOCKED' 
        : 'LOGIN_FAILURE';

      logAudit({
        ...context,
        user: user?._id,
        role: user?.role,
        store: user?.store,
        action,
        entityType: 'AUTH',
        entityId: user?._id?.toString(),
        severity: action === 'LOGIN_LOCKED' ? 'HIGH' : 'MEDIUM',
        message: loginError.message
      });

      res.status(401).json({ error: loginError.message });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { loginHandler };

