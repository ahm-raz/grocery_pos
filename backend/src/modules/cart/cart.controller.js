import { addItemToCart, updateItemQuantity, removeItemFromCart, getCart } from './cart.service.js';

const addItem = async (req, res) => {
  try {
    const { storeId: requestedStoreId, productId, quantity } = req.body;
    const storeId = requestedStoreId || req.userStoreId;
    const userId = req.user._id;

    if (!storeId || !productId || !quantity) {
      if (req.user.role === 'ADMIN' && !storeId) {
        return res.status(400).json({ error: 'Store ID is required. Please select a store to add items to cart.' });
      }
      return res.status(400).json({ error: 'Missing required fields: storeId, productId, quantity' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && storeId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot access cart from other stores.' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const cart = await addItemToCart(storeId, userId, productId, quantity);
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { storeId: requestedStoreId, productId, quantity } = req.body;
    const storeId = requestedStoreId || req.userStoreId;
    const userId = req.user._id;

    if (!storeId || !productId || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields: storeId, productId, quantity' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && storeId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot access cart from other stores.' });
    }

    const cart = await updateItemQuantity(storeId, userId, productId, quantity);
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const { storeId: requestedStoreId, productId } = req.body;
    const storeId = requestedStoreId || req.userStoreId;
    const userId = req.user._id;

    if (!storeId || !productId) {
      return res.status(400).json({ error: 'Missing required fields: storeId, productId' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && storeId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot access cart from other stores.' });
    }

    const cart = await removeItemFromCart(storeId, userId, productId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCartHandler = async (req, res) => {
  try {
    const requestedStoreId = req.query.storeId;
    const storeId = requestedStoreId || req.userStoreId;
    const userId = req.user._id;

    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Validate store access
    if (req.user.role !== 'ADMIN' && storeId.toString() !== req.userStoreId) {
      return res.status(403).json({ error: 'Access denied. Cannot access cart from other stores.' });
    }

    const cart = await getCart(storeId, userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { addItem, updateItem, removeItem, getCartHandler };

