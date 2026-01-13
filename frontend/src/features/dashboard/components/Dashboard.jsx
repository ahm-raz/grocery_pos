import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext.jsx';
import { alertsAPI } from '@api/alerts.js';
import { reportsAPI } from '@api/reports.js';
import { ROLES } from '@utils/roles.js';
import Loading from '@components/common/Loading.jsx';
import MetricCard from '@components/common/MetricCard.jsx';
import SalesChart from '@components/common/SalesChart.jsx';
import PaymentsChart from '@components/common/PaymentsChart.jsx';
import AlertsPanel from '@components/common/AlertsPanel.jsx';
import { formatCurrency } from '@utils/formatCurrency.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState(null);
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const storeId = user?.store?._id || user?.store;
        const role = user?.role;

        const promises = [];

        promises.push(alertsAPI.getInventoryAlerts(storeId).catch(() => null));

        if ([ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT].includes(role)) {
          promises.push(reportsAPI.getSales(storeId, null, null, 30).catch(() => null));
        } else {
          promises.push(Promise.resolve(null));
        }

        if ([ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE].includes(role)) {
          promises.push(reportsAPI.getInventory(storeId, 50).catch(() => null));
        } else {
          promises.push(Promise.resolve(null));
        }

        if ([ROLES.ADMIN, ROLES.ACCOUNTANT].includes(role)) {
          promises.push(reportsAPI.getPayments(storeId, null, null).catch(() => null));
        } else {
          promises.push(Promise.resolve(null));
        }

        const [alertsData, salesData, inventoryData, paymentsData] = await Promise.all(promises);
        
        setAlerts(alertsData);
        setSales(salesData);
        setInventory(inventoryData);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) return <Loading />;

  const role = user?.role;

  if (role === ROLES.CASHIER) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Cashier Dashboard</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Welcome, {user?.name}! Use the POS page to process sales.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title="Today's Sales"
              value={sales?.summary?.totalRevenue ? formatCurrency(sales.summary.totalRevenue) : '$0.00'}
              color="green"
            />
            <MetricCard
              title="Today's Orders"
              value={sales?.summary?.totalOrders || 0}
              color="blue"
            />
          </div>
        </div>
      </div>
    );
  }

  if (role === ROLES.WAREHOUSE) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Warehouse Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Products"
            value={inventory?.summary?.totalProducts || 0}
            color="blue"
          />
          <MetricCard
            title="Low Stock Items"
            value={alerts?.summary?.lowStockCount || 0}
            color="yellow"
          />
          <MetricCard
            title="Expiring Items"
            value={alerts?.summary?.expiringCount || 0}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsPanel alerts={alerts} title="Inventory Alerts" />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Inventory Items</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {inventory?.items?.slice(0, 10).map((item) => (
                <div key={item.productId} className="flex justify-between items-center p-2 border dark:border-gray-700 rounded dark:bg-gray-700">
                  <div>
                    <p className="font-medium text-sm dark:text-white">{item.productName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.productSku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${item.isLowStock ? 'text-yellow-600 dark:text-yellow-400' : item.isOutOfStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {item.quantity} units
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === ROLES.ACCOUNTANT) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Financial Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={sales?.summary?.totalRevenue ? formatCurrency(sales.summary.totalRevenue) : '$0.00'}
            subtitle="Last 30 days"
            color="green"
          />
          <MetricCard
            title="Total Orders"
            value={sales?.summary?.totalOrders || 0}
            subtitle="Last 30 days"
            color="blue"
          />
          <MetricCard
            title="Total Payments"
            value={payments?.summary?.totalAmount ? formatCurrency(payments.summary.totalAmount) : '$0.00'}
            subtitle="Last 30 days"
            color="purple"
          />
          <MetricCard
            title="Payment Methods"
            value={payments?.byMethod?.length || 0}
            subtitle="Active methods"
            color="gray"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesChart data={sales} />
          <PaymentsChart data={payments} />
        </div>

        {payments?.byMethod && payments.byMethod.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Method</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transactions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.byMethod.map((method) => (
                    <tr key={method.method}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{method.method}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(method.totalAmount)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">{method.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (role === ROLES.MANAGER) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Manager Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={sales?.summary?.totalRevenue ? formatCurrency(sales.summary.totalRevenue) : '$0.00'}
            subtitle="Last 30 days"
            color="green"
          />
          <MetricCard
            title="Total Orders"
            value={sales?.summary?.totalOrders || 0}
            subtitle="Last 30 days"
            color="blue"
          />
          <MetricCard
            title="Low Stock Items"
            value={alerts?.summary?.lowStockCount || 0}
            color="yellow"
          />
          <MetricCard
            title="Expiring Items"
            value={alerts?.summary?.expiringCount || 0}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesChart data={sales} />
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={sales?.summary?.totalRevenue ? formatCurrency(sales.summary.totalRevenue) : '$0.00'}
          subtitle="Last 30 days"
          color="green"
        />
        <MetricCard
          title="Total Orders"
          value={sales?.summary?.totalOrders || 0}
          subtitle="Last 30 days"
          color="blue"
        />
        <MetricCard
          title="Low Stock Items"
          value={alerts?.summary?.lowStockCount || 0}
          color="yellow"
        />
        <MetricCard
          title="Expiring Items"
          value={alerts?.summary?.expiringCount || 0}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart data={sales} />
        <PaymentsChart data={payments} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel alerts={alerts} />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory Summary</h3>
          <div className="space-y-4">
            <MetricCard
              title="Total Products"
              value={inventory?.summary?.totalProducts || 0}
              color="blue"
            />
            <MetricCard
              title="Out of Stock"
              value={inventory?.summary?.outOfStock || 0}
              color="red"
            />
            <MetricCard
              title="Low Stock"
              value={inventory?.summary?.lowStock || 0}
              color="yellow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

