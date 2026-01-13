import Cart from '../../models/Cart.js';
import Inventory from '../../models/Inventory.js';
import Product from '../../models/Product.js';

// Multi-cashier support: Each user has their own cart per store

const getOrCreateCart = async (storeId, userId) => {
  let cart = await Cart.findOne({ store: storeId, user: userId })
    .populate('items.product', 'sku name unitType price');

  if (!cart) {
    cart = new Cart({
      store: storeId,
      user: userId,
      items: [],
      subtotal: 0
    });
    await cart.save();
  }

  return cart;
};

const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
};

const validateStock = async (productId, storeId, requestedQuantity) => {
  const inventory = await Inventory.findOne({ product: productId, store: storeId });
  
  if (!inventory) {
    throw new Error('Product not available in this store');
  }

  const availableQuantity = inventory.batches.reduce((sum, batch) => sum + batch.quantity, 0);
  
  if (requestedQuantity > availableQuantity) {
    throw new Error(`Insufficient stock. Available: ${availableQuantity}, requested: ${requestedQuantity}`);
  }

  return true;
};

const addItemToCart = async (storeId, userId, productId, quantity) => {
  // Validate stock availability
  await validateStock(productId, storeId, quantity);

  // Get product for pricing
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Get or create cart
  const cart = await getOrCreateCart(storeId, userId);

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex >= 0) {
    // Update existing item - validate total quantity
    const currentQuantity = cart.items[existingItemIndex].quantity;
    const newTotalQuantity = currentQuantity + quantity;
    
    await validateStock(productId, storeId, newTotalQuantity);

    cart.items[existingItemIndex].quantity = newTotalQuantity;
    cart.items[existingItemIndex].lineTotal = newTotalQuantity * product.price;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      unitPrice: product.price,
      lineTotal: quantity * product.price
    });
  }

  // Recalculate subtotal
  cart.subtotal = calculateSubtotal(cart.items);
  await cart.save();

  await cart.populate('items.product', 'sku name unitType price');
  return cart;
};

const updateItemQuantity = async (storeId, userId, productId, quantity) => {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Validate stock availability
  await validateStock(productId, storeId, quantity);

  const cart = await Cart.findOne({ store: storeId, user: userId });
  if (!cart) {
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  // Get product for pricing
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Update quantity and line total
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].lineTotal = quantity * product.price;

  // Recalculate subtotal
  cart.subtotal = calculateSubtotal(cart.items);
  await cart.save();

  await cart.populate('items.product', 'sku name unitType price');
  return cart;
};

const removeItemFromCart = async (storeId, userId, productId) => {
  const cart = await Cart.findOne({ store: storeId, user: userId });
  if (!cart) {
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  // Remove item
  cart.items.splice(itemIndex, 1);

  // Recalculate subtotal
  cart.subtotal = calculateSubtotal(cart.items);
  await cart.save();

  await cart.populate('items.product', 'sku name unitType price');
  return cart;
};

const getCart = async (storeId, userId) => {
  const cart = await getOrCreateCart(storeId, userId);
  return cart;
};

export { addItemToCart, updateItemQuantity, removeItemFromCart, getCart };

