import { getProductsWithAvailability, searchProducts } from './products.pos.service.js';
import { getStoreIdForQuery } from '../../middleware/storeScope.js';

const getProducts = async (req, res) => {
  try {
    const storeId = getStoreIdForQuery(req);
    if (!storeId && req.user.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Store ID is required' });
    }
    const products = await getProductsWithAvailability(storeId);
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchProductsHandler = async (req, res) => {
  try {
    const { q } = req.query;
    const storeId = getStoreIdForQuery(req);
    
    if (!q) {
      return res.status(400).json({ error: 'Search query parameter "q" is required' });
    }

    if (!storeId && req.user.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const products = await searchProducts(storeId, q);
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { getProducts, searchProductsHandler };

