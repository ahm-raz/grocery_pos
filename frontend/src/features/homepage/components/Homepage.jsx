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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className=" rounded-2xl shadow-soft p-6 sm:p-8 mb-6 sm:mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                  Welcome to POS System
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {user?.store?.name || 'Store'}
                </p>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <p className="text-sm sm:text-base font-semibold mb-1">
                  {user?.name}
                </p>
                <p className="text-xs sm:text-sm text-blue-100 uppercase font-medium">
                  {role}
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/30">
              <p className="text-sm sm:text-base text-blue-100 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {navigationCards.map((card, index) => (
            <AnimatedCard
              key={card.id}
              delay={index * 0.05}
              onClick={() => navigate(card.route)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-glow border border-gray-200/50 dark:border-gray-700/50 p-5 sm:p-6 text-left group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 transform group-hover:translate-x-1"
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
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                {card.description}
              </p>
            </AnimatedCard>
          ))}
        </div>

        {/* Quick Actions for CASHIER */}
        {role === ROLES.CASHIER && (
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-soft p-6 sm:p-8 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <span>⚡</span>
              Quick Actions
            </h2>
            <Button
              variant="primary"
              onClick={() => navigate('/pos')}
              className="w-full sm:w-auto bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
            >
              Start POS Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;

