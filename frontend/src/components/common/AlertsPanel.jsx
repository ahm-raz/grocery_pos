import { formatDate } from '@utils/formatDate.js';

const AlertsPanel = ({ alerts, title = 'Alerts' }) => {
  if (!alerts || (!alerts.lowStock?.length && !alerts.expiring?.length)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      
      {alerts.lowStock?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Low Stock Items ({alerts.lowStock.length})
          </h3>
          <div className="space-y-2">
            {alerts.lowStock.slice(0, 10).map((item) => (
              <div key={item._id} className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {item.product?.name || 'Unknown Product'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">SKU: {item.product?.sku || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    {item.quantity} / {item.lowStockThreshold}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.expiring?.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Expiring Soon ({alerts.expiring.length})
          </h3>
          <div className="space-y-2">
            {alerts.expiring.slice(0, 10).map((item) => (
              <div key={item._id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {item.product?.name || 'Unknown Product'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Batch: {item.batchNumber || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    {item.quantity} units
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Expires: {item.expiryDate ? formatDate(item.expiryDate) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;

