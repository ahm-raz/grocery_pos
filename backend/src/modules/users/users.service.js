import bcrypt from 'bcrypt';
import User from '../../models/User.js';

const createUser = async (userData) => {
  const { name, email, password, role, store } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = new User({
    name,
    email,
    passwordHash,
    role,
    store
  });

  await user.save();

  // Return user without password hash
  const userObject = user.toObject();
  delete userObject.passwordHash;

  return userObject;
};

const getUsers = async (storeId, includeInactive = false) => {
  const query = {};
  
  // Only filter by isActive if we don't want to include inactive users
  if (!includeInactive) {
    query.isActive = true;
  }
  
  if (storeId) {
    query.store = storeId;
  }

  const users = await User.find(query)
    .populate('store', 'name')
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return users;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .populate('store', 'name')
    .select('-passwordHash');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Handle password update separately
  if (updateData.password) {
    const saltRounds = 10;
    updateData.passwordHash = await bcrypt.hash(updateData.password, saltRounds);
    delete updateData.password;
  }

  // Update fields
  Object.assign(user, updateData);
  await user.save();

  // Return user without password hash
  const userObject = user.toObject();
  delete userObject.passwordHash;

  return userObject;
};

const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Soft delete - set isActive to false
  user.isActive = false;
  await user.save();

  // Return user without password hash
  const userObject = user.toObject();
  delete userObject.passwordHash;

  return userObject;
};

const activateUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Activate user - set isActive to true
  user.isActive = true;
  await user.save();

  // Return user without password hash
  const userObject = user.toObject();
  delete userObject.passwordHash;

  return userObject;
};

const permanentDeleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Permanent delete - remove from database
  await User.findByIdAndDelete(userId);

  return { _id: userId, deleted: true };
};

export { createUser, getUsers, getUserById, updateUser, deleteUser, activateUser, permanentDeleteUser };

