import Store from '../../models/Store.js';

const createStore = async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.status(200).json(store);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getStores = async (req, res) => {
  try {
    const stores = await Store.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(stores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { createStore, getStore, getStores };

