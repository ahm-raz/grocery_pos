import { useState, useRef, useEffect } from 'react';
import { usePinLock } from '@context/PinLockContext.jsx';
import { useAuth } from '@context/AuthContext.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';

const PinLockScreen = () => {
  const { unlock } = usePinLock();
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setPin(value);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    const isValid = unlock(pin);
    
    if (isValid) {
      setPin('');
      setError('');
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
      setError('Incorrect PIN. Please try again.');
      setPin('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 dark:bg-gray-950 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Re-Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {user?.name ? `Welcome back, ${user.name}` : 'Please enter your PIN to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
              Enter 4-Digit PIN
            </label>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              onKeyPress={handleKeyPress}
              className="w-full text-center text-3xl tracking-widest font-mono px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded text-center text-sm">
              {error}
            </div>
          )}

          {attempts > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Attempts: {attempts}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={pin.length !== 4}
          >
            Unlock
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Session was closed. PIN required for security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PinLockScreen;

