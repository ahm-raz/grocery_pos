import { getExpiringItems, getInventoryAlerts } from './alerts.service.js';
import { getStoreIdForQuery } from '../../middleware/storeScope.js';

const getExpiring = async (req, res) => {
  try {
    const { daysWarning } = req.query;
    const storeId = getStoreIdForQuery(req);
    const days = daysWarning ? parseInt(daysWarning) : 7;
    const items = await getExpiringItems(storeId, days);
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAlerts = async (req, res) => {
  try {
    const { daysWarning } = req.query;
    const storeId = getStoreIdForQuery(req);
    const days = daysWarning ? parseInt(daysWarning) : 7;
    const alerts = await getInventoryAlerts(storeId, days);
    res.status(200).json(alerts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { getExpiring, getAlerts };

