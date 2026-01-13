import { useState, useEffect } from 'react';
import Button from './Button.jsx';
import Input from './Input.jsx';
import AnimatedModal from './AnimatedModal.jsx';
import { formatCurrency } from '@utils/formatCurrency.js';

const PaymentModal = ({ isOpen, onClose, subtotal, tax = 0, onConfirm }) => {
  const [payments, setPayments] = useState([{ method: 'CASH', amount: 0 }]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const total = subtotal + tax;

  useEffect(() => {
    if (isOpen) {
      setPayments([{ method: 'CASH', amount: total }]);
      setError('');
    }
  }, [isOpen, total]);

  const handlePaymentChange = (index, field, value) => {
    const updated = [...payments];
    if (field === 'method') {
      updated[index].method = value;
    } else if (field === 'amount') {
      updated[index].amount = parseFloat(value) || 0;
    }
    setPayments(updated);
  };

  const addPayment = () => {
    setPayments([...payments, { method: 'CASH', amount: 0 }]);
  };

  const removePayment = (index) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const handleConfirm = async () => {
    setError('');
    
    if (payments.length === 0) {
      setError('At least one payment method is required');
      return;
    }

    const amountPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    if (amountPaid < total) {
      setError(`Insufficient payment. Total: ${formatCurrency(total)}, Paid: ${formatCurrency(amountPaid)}`);
      return;
    }

    setProcessing(true);
    try {
      await onConfirm(payments, tax);
      onClose();
    } catch (error) {
      setError(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const amountPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const change = amountPaid - total;

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment</h2>
        
        <div className="mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
            <span className="font-semibold dark:text-white">{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Tax:</span>
              <span className="font-semibold dark:text-white">{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t dark:border-gray-700 pt-2">
            <span className="dark:text-white">Total:</span>
            <span className="dark:text-white">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Methods</label>
            <Button variant="secondary" onClick={addPayment} className="text-sm py-1 px-2">
              + Add
            </Button>
          </div>
          {payments.map((payment, index) => (
            <div key={index} className="flex gap-2 mb-2 items-end">
              <div className="flex-1">
                <select
                  value={payment.method}
                  onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="E_WALLET">E-Wallet</option>
                </select>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  value={payment.amount || ''}
                  onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="mb-0"
                />
              </div>
              {payments.length > 1 && (
                <Button
                  variant="danger"
                  onClick={() => removePayment(index)}
                  className="py-2 px-3"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mb-4 space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Amount Paid:</span>
            <span className="font-semibold dark:text-white">{formatCurrency(amountPaid)}</span>
          </div>
          {change > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Change:</span>
              <span className="font-bold">{formatCurrency(change)}</span>
            </div>
          )}
          {amountPaid < total && (
            <div className="flex justify-between text-red-600 dark:text-red-400 text-sm">
              <span>Remaining:</span>
              <span>{formatCurrency(total - amountPaid)}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={processing} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleConfirm}
            disabled={processing || amountPaid < total}
            className="flex-1"
          >
            {processing ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default PaymentModal;

