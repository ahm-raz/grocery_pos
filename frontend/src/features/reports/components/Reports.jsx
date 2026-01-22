import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext.jsx';
import { reportsAPI } from '@api/reports.js';
import { formatCurrency } from '@utils/formatCurrency.js';
import { formatDate } from '@utils/formatDate.js';
import Loading from '@components/common/Loading.jsx';

const Reports = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const storeId = user?.store?._id || user?.store;

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [salesData, inventoryData] = await Promise.all([
        reportsAPI.getSales(storeId),
        reportsAPI.getInventory(storeId),
      ]);
      setSales(salesData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-8">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sales Summary</h2>
          {sales?.summary && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Total Revenue:</span>
                <span className="font-bold dark:text-white">{formatCurrency(sales.summary.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Total Orders:</span>
                <span className="font-bold dark:text-white">{sales.summary.totalOrders}</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 dark:text-gray-300">Date</th>
                  <th className="text-right py-2 dark:text-gray-300">Revenue</th>
                  <th className="text-right py-2 dark:text-gray-300">Orders</th>
                </tr>
              </thead>
              <tbody>
                {sales?.dailySales?.slice(0, 10).map((day, idx) => (
                  <tr key={idx} className="border-b dark:border-gray-700">
                    <td className="py-2 dark:text-gray-300">{day.date}</td>
                    <td className="text-right py-2 dark:text-gray-300">{formatCurrency(day.totalRevenue)}</td>
                    <td className="text-right py-2 dark:text-gray-300">{day.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Inventory Summary</h2>
          {inventory?.summary && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between dark:text-gray-300">
                <span>Total Products:</span>
                <span className="font-bold dark:text-white">{inventory.summary.totalProducts}</span>
              </div>
              <div className="flex justify-between dark:text-gray-300">
                <span>Low Stock:</span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400">{inventory.summary.lowStock}</span>
              </div>
              <div className="flex justify-between dark:text-gray-300">
                <span>Out of Stock:</span>
                <span className="font-bold text-red-600 dark:text-red-400">{inventory.summary.outOfStock}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

