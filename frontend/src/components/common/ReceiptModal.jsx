import { useEffect, useState } from 'react';
import Button from './Button.jsx';
import AnimatedModal from './AnimatedModal.jsx';
import { receiptsAPI } from '@api/receipts.js';
import Loading from './Loading.jsx';

const ReceiptModal = ({ isOpen, onClose, orderId }) => {
  const [receiptHTML, setReceiptHTML] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && orderId) {
      loadReceipt();
    } else {
      setReceiptHTML('');
      setError('');
    }
  }, [isOpen, orderId]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      setError('');
      const html = await receiptsAPI.getReceipt(orderId);
      setReceiptHTML(html);
    } catch (error) {
      setError('Failed to load receipt');
      console.error('Error loading receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!receiptHTML) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              @media print {
                body { padding: 0; }
                @page { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${receiptHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt</h2>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loading />
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && receiptHTML && (
          <>
            <div 
              className="mb-4 border-2 border-gray-200 dark:border-gray-700 rounded overflow-auto p-4 bg-white dark:bg-gray-900"
              style={{ maxHeight: '600px' }}
              dangerouslySetInnerHTML={{ __html: receiptHTML }}
            />

            <div className="flex gap-3">
              <Button variant="primary" onClick={handlePrint} className="flex-1">
                Print Receipt
              </Button>
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </>
        )}

        {!loading && !error && !receiptHTML && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No receipt data available
          </div>
        )}
      </div>
    </AnimatedModal>
  );
};

export default ReceiptModal;

