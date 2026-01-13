import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

const generateToken = (userId, email, role) => {
  // Short-lived access tokens (1 hour for production, 24h for dev)
  const expiresIn = process.env.NODE_ENV === 'production' ? '1h' : '24h';
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

const isAccountLocked = (user) => {
  if (!user.lockedUntil) {
    return false;
  }
  return new Date() < user.lockedUntil;
};

const checkAndLockAccount = async (user) => {
  const now = new Date();
  
  // Reset failed count if lockout period has passed
  if (user.lockedUntil && now >= user.lockedUntil) {
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    user.lastFailedAt = null;
    await user.save();
    return false;
  }

  // Check if account is currently locked
  if (isAccountLocked(user)) {
    return true;
  }

  // Increment failed attempts
  user.failedLoginCount = (user.failedLoginCount || 0) + 1;
  user.lastFailedAt = now;

  // Lock account if max attempts reached
  if (user.failedLoginCount >= MAX_FAILED_ATTEMPTS) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
    user.lockedUntil = lockUntil;
  }

  await user.save();
  return isAccountLocked(user);
};

const resetFailedAttempts = async (user) => {
  if (user.failedLoginCount > 0 || user.lockedUntil) {
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    user.lastFailedAt = null;
    await user.save();
  }
};

const login = async (email, password, ipAddress, userAgent) => {
  // Find user with password hash
  const user = await User.findOne({ email }).select('+passwordHash');
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('User account is deactivated');
  }

  // Check if account is locked
  if (isAccountLocked(user)) {
    const minutesRemaining = Math.ceil((user.lockedUntil - new Date()) / 60000);
    throw new Error(`Account locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`);
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    const isLocked = await checkAndLockAccount(user);
    if (isLocked) {
      throw new Error(`Account locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`);
    }
    throw new Error('Invalid email or password');
  }

  // Reset failed attempts on successful login
  await resetFailedAttempts(user);

  // Populate store before returning user data
  await user.populate('store', 'name storeCode');

  // Generate JWT token
  const token = generateToken(user._id, user.email, user.role);

  // Return user data without password hash
  const userData = user.toObject();
  delete userData.passwordHash;
  delete userData.failedLoginCount;
  delete userData.lastFailedAt;
  delete userData.lockedUntil;

  return {
    user: userData,
    token
  };
};

export { login, generateToken, isAccountLocked };