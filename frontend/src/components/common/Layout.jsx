import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext.jsx';
import { useTheme } from '@context/ThemeContext.jsx';
import Button from './Button.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedNavOpen, setExpandedNavOpen] = useState(false);
  const [visibleLinksCount, setVisibleLinksCount] = useState(3); // Start with 3 visible links
  const expandedNavRef = useRef(null);

  // Close expanded nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedNavRef.current && !expandedNavRef.current.contains(event.target)) {
        setExpandedNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close expanded nav on route change
  useEffect(() => {
    setExpandedNavOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Adjust visible links count based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setVisibleLinksCount(5); // xl screens
      } else if (width >= 1024) {
        setVisibleLinksCount(4); // lg screens
      } else if (width >= 768) {
        setVisibleLinksCount(3); // md screens
      } else {
        setVisibleLinksCount(2); // sm screens
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Role-based access control
  const canAccessPOS = ['ADMIN', 'MANAGER', 'CASHIER'].includes(user?.role);
  const canAccessInventory = ['ADMIN', 'MANAGER', 'WAREHOUSE'].includes(user?.role);
  const canAccessReports = ['ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(user?.role);
  const canAccessPurchaseOrders = ['ADMIN', 'MANAGER', 'WAREHOUSE'].includes(user?.role);
  const canAccessUsers = user?.role === 'ADMIN';

  // All navigation links
  const allNavLinks = [
    { path: '/homepage', label: 'Home', icon: '🏠', show: true },
    { path: '/dashboard', label: 'Dashboard', icon: '📊', show: true },
    { path: '/pos', label: 'POS', icon: '💳', show: canAccessPOS },
    { path: '/products', label: 'Products', icon: '📦', show: canAccessInventory },
    { path: '/categories', label: 'Categories', icon: '🏷️', show: canAccessInventory },
    { path: '/inventory', label: 'Inventory', icon: '📋', show: canAccessInventory },
    { path: '/purchase-orders', label: 'Purchase Orders', icon: '📝', show: canAccessPurchaseOrders },
    { path: '/reports', label: 'Reports', icon: '📈', show: canAccessReports },
    { path: '/users', label: 'Users', icon: '👥', show: canAccessUsers },
  ].filter(link => link.show);

  // Split into visible and hidden links
  const visibleNavLinks = allNavLinks.slice(0, visibleLinksCount);
  const hiddenNavLinks = allNavLinks.slice(visibleLinksCount);

  // For mobile menu - show all links
  const mobileNavLinks = allNavLinks;

  // Get role badge color
  const getRoleColor = (role) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'MANAGER': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'CASHIER': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'WAREHOUSE': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'ACCOUNTANT': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left side */}
            <div className="flex items-center">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 shadow-md group-hover:shadow-lg">
                  <span className="text-white font-bold">🛒</span>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Grocery POS
                  </span>
                </div>
              </Link>
            </div>

            {/* Center Navigation Links - Visible Links + Expand Button */}
            <div className="flex-1 flex justify-center">
              <div className="hidden lg:flex items-center space-x-1 relative">
                {/* Visible navigation links */}
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 shadow-inner">
                  {visibleNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive(link.path)
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-md'
                      }`}
                    >
                      <span className="text-base">{link.icon}</span>
                      <span className="hidden xl:inline">{link.label}</span>
                      {isActive(link.path) && (
                        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-white rounded-full animate-pulse"></span>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Expand/Collapse Button for hidden links */}
                {hiddenNavLinks.length > 0 && (
                  <div className="relative" ref={expandedNavRef}>
                    <button
                      onClick={() => setExpandedNavOpen(!expandedNavOpen)}
                      className={`ml-2 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                        expandedNavOpen ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                      }`}
                      aria-label="Toggle more navigation links"
                    >
                      <svg 
                        className={`w-5 h-5 transition-transform duration-300 ${expandedNavOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {hiddenNavLinks.length}
                      </span>
                    </button>

                    {/* Expanded Navigation Dropdown */}
                    {expandedNavOpen && (
                      <div className="absolute top-full mt-2 right-0 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                        <div className="p-2">
                          <div className="px-3 py-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              More Links
                            </span>
                          </div>
                          {hiddenNavLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive(link.path)
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="text-base">{link.icon}</span>
                              <span>{link.label}</span>
                              {isActive(link.path) && (
                                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900/50">
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400 px-2">
                            {allNavLinks.length} total navigation items
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* User profile desktop */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(user?.role)}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                
                {/* Logout button */}
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${
                  mobileMenuOpen
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Visible links section */}
              <div className="px-3 pt-4 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Main Navigation
                </span>
              </div>
              
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="flex-1">{link.label}</span>
                  {isActive(link.path) && (
                    <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
              ))}
              
              {/* User profile mobile */}
              <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <div className="flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {user?.name}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleColor(user?.role)}`}>
                      {user?.role}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleLogout} 
                  className="w-full mx-2 flex items-center justify-center space-x-2 py-3.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 dark:text-gray-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;