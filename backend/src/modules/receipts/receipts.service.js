// Generate printable HTML receipt
const generateReceiptHTML = (order, store, user) => {
  const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentsList = order.payments.map(p => 
    `${p.method}: $${p.amount.toFixed(2)}`
  ).join('<br>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - Order #${order._id.toString().slice(-8)}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      width: 300px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .store-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .store-address {
      font-size: 12px;
      color: #666;
    }
    .order-info {
      margin-bottom: 15px;
      font-size: 12px;
    }
    .items {
      border-bottom: 1px dashed #ccc;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }
    .item-name {
      flex: 1;
    }
    .item-qty {
      margin: 0 10px;
    }
    .item-price {
      text-align: right;
      min-width: 60px;
    }
    .totals {
      margin-top: 15px;
      font-size: 13px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .total-row.final {
      border-top: 2px solid #000;
      padding-top: 5px;
      margin-top: 10px;
      font-weight: bold;
      font-size: 14px;
    }
    .payment-info {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px dashed #ccc;
      font-size: 12px;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #666;
      border-top: 1px dashed #ccc;
      padding-top: 10px;
    }
    @media print {
      body {
        width: 100%;
      }
      @page {
        size: 80mm auto;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="store-name">${store?.name || 'Store'}</div>
    <div class="store-address">${store?.address || ''}</div>
  </div>
  
  <div class="order-info">
    <div>Order #: ${order._id.toString().slice(-8)}</div>
    <div>Date: ${orderDate}</div>
    <div>Cashier: ${user?.name || 'System'}</div>
  </div>
  
  <div class="items">
    ${order.items.map(item => `
      <div class="item">
        <div class="item-name">${item.product?.name || 'Unknown'}</div>
        <div class="item-qty">${item.quantity}x</div>
        <div class="item-price">$${item.lineTotal.toFixed(2)}</div>
      </div>
      <div style="font-size: 10px; color: #666; margin-left: 5px;">
        $${item.unitPrice.toFixed(2)} each
      </div>
    `).join('')}
  </div>
  
  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>$${order.subtotal.toFixed(2)}</span>
    </div>
    ${order.tax > 0 ? `
    <div class="total-row">
      <span>Tax:</span>
      <span>$${order.tax.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="total-row final">
      <span>TOTAL:</span>
      <span>$${order.total.toFixed(2)}</span>
    </div>
  </div>
  
  <div class="payment-info">
    <div><strong>Payment:</strong></div>
    <div>${paymentsList}</div>
    <div style="margin-top: 5px;">
      <span>Amount Paid: $${order.amountPaid.toFixed(2)}</span>
    </div>
    ${order.change > 0 ? `
    <div>
      <span>Change: $${order.change.toFixed(2)}</span>
    </div>
    ` : ''}
  </div>
  
  <div class="footer">
    <div>Thank you for your purchase!</div>
    <div style="margin-top: 5px;">${order._id.toString().slice(-8)}</div>
  </div>
</body>
</html>
  `;
};

export { generateReceiptHTML };

