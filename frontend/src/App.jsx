import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@context/AuthContext.jsx';
import { ThemeProvider } from '@context/ThemeContext.jsx';
import { PinLockProvider, usePinLock } from '@context/PinLockContext.jsx';
import ProtectedRoute from '@components/common/ProtectedRoute.jsx';
import PinLockScreen from '@components/common/PinLockScreen.jsx';
import AnimatedRoute from '@components/common/AnimatedRoute.jsx';
import Layout from '@components/common/Layout.jsx';
import Login from '@features/auth/components/Login.jsx';
import Homepage from '@features/homepage/components/Homepage.jsx';
import Dashboard from '@features/dashboard/components/Dashboard.jsx';
import POS from '@features/pos/components/POS.jsx';
import Inventory from '@features/inventory/components/Inventory.jsx';
import Products from '@features/products/components/Products.jsx';
import Categories from '@features/categories/components/Categories.jsx';
import Reports from '@features/reports/components/Reports.jsx';
import PurchaseOrders from '@features/purchase-orders/components/PurchaseOrders.jsx';
import Users from '@features/users/components/Users.jsx';
import { ROLES } from '@utils/roles.js';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const { isLocked, isChecking } = usePinLock();
  const location = useLocation();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (isLocked) {
    return <PinLockScreen />;
  }

  const isLoginRoute = location.pathname === '/login';
  const skipAnimation = isLoginRoute;

  return (
    <AnimatedRoute skipAnimation={skipAnimation}>
      <Routes location={location}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/homepage" replace />} />
        <Route
          path="/homepage"
          element={
            <ProtectedRoute>
              <Layout>
                <Homepage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}>
              <Layout>
                <POS />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
              <Layout>
                <Categories />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE]}>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT]}>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE]}>
              <Layout>
                <PurchaseOrders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/homepage" : "/login"} replace />} />
      </Routes>
    </AnimatedRoute>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PinLockProvider>
            <AppRoutes />
          </PinLockProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
