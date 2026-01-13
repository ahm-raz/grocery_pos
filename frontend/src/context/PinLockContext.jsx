import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const PinLockContext = createContext();

export const usePinLock = () => {
  const context = useContext(PinLockContext);
  if (!context) {
    throw new Error('usePinLock must be used within PinLockProvider');
  }
  return context;
};

// Hardcoded PIN for all roles (as per requirements)
const VALID_PIN = '1234';

export const PinLockProvider = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      return;
    }

    // Check if we need to show PIN lock
    const checkPinLock = () => {
      if (!isAuthenticated || !user) {
        setIsLocked(false);
        setIsChecking(false);
        return;
      }

      // Check if JWT exists
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLocked(false);
        setIsChecking(false);
        return;
      }

      // Check if this is a fresh page load (session was closed)
      const sessionActive = sessionStorage.getItem('sessionActive');
      
      if (!sessionActive) {
        // Fresh load with valid JWT = require PIN
        setIsLocked(true);
      } else {
        // Active session = no PIN required
        setIsLocked(false);
      }
      
      setIsChecking(false);
    };

    checkPinLock();
  }, [isAuthenticated, user, loading]);

  // Mark session as active when PIN is unlocked
  const unlock = (pin) => {
    if (pin === VALID_PIN) {
      setIsLocked(false);
      sessionStorage.setItem('sessionActive', 'true');
      return true;
    }
    return false;
  };

  // Lock the app (for logout or manual lock)
  const lock = () => {
    setIsLocked(true);
    sessionStorage.removeItem('sessionActive');
  };

  // Clear PIN state on logout
  const clearPinState = () => {
    sessionStorage.removeItem('sessionActive');
    setIsLocked(false);
  };

  return (
    <PinLockContext.Provider value={{ isLocked, isChecking, unlock, lock, clearPinState }}>
      {children}
    </PinLockContext.Provider>
  );
};

