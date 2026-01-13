import { useAuth } from '@context/AuthContext.jsx';
import { ROLES } from '@utils/roles.js';
import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button.jsx';
import AnimatedCard from '@components/common/AnimatedCard.jsx';

const Homepage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const role = user?.role;

  // Define navigation cards based on role
  const getNavigationCards = () => {
    const allCards = [
      {
        id: 'pos',
        title: 'POS / Checkout',
        description: 'Process sales and checkout',
        icon: '🛒',
        route: '/pos',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        description: 'View metrics and analytics',
        icon: '📊',
        route: '/dashboard',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.WAREHOUSE]
      },
      {
        id: 'products',
        title: 'Products',
        description: 'Manage products and pricing',
        icon: '🛍️',
        route: '/products',
        roles: [ROLES.ADMIN, ROLES.MANAGER]
      },
      {
        id: 'categories',
        title: 'Categories',
        description: 'Manage product categories',
        icon: '📁',
        route: '/categories',
        roles: [ROLES.ADMIN, ROLES.MANAGER]
      },
      {
        id: 'inventory',
        title: 'Inventory',
        description: 'Manage stock and batches',
        icon: '📦',
        route: '/inventory',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE]
      },
      {
        id: 'reports',
        title: 'Reports',
        description: 'Sales and inventory reports',
        icon: '📈',
        route: '/reports',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT]
      },
      {
        id: 'purchase-orders',
        title: 'Purchase Orders',
        description: 'Manage supplier orders',
        icon: '📋',
        route: '/purchase-orders',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE]
      },
      {
        id: 'users',
        title: 'User Management',
        description: 'Manage users and roles',
        icon: '👥',
        route: '/users',
        roles: [ROLES.ADMIN]
      }
    ];

    // Filter cards based on user role
    if (role === ROLES.ADMIN) {
      return allCards;
    }
    return allCards.filter(card => card.roles.includes(role));
  };

  const navigationCards = getNavigationCards();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                POS System
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {user?.store?.name || 'Store'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase">
                {role}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentDate}
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCards.map((card, index) => (
            <AnimatedCard
              key={card.id}
              delay={index * 0.05}
              onClick={() => navigate(card.route)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-left group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{card.icon}</div>
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {card.description}
              </p>
            </AnimatedCard>
          ))}
        </div>

        {/* Quick Actions for CASHIER */}
        {role === ROLES.CASHIER && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={() => navigate('/pos')}
                className="flex-1"
              >
                Start POS Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;

