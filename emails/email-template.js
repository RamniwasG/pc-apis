const orderEmailTemplate = (order) => {
    const { customerName, items, totalAmount, shippingAddress, year } = order;
  return `
    <!DOCTYPE html>
    <html>
        <head>
        <meta charset="UTF-8" />
        <title>Order Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background: #111827;
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                }
                .order-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                .order-table th,
                .order-table td {
                    padding: 10px;
                    border-bottom: 1px solid #e5e7eb;
                    text-align: left;
                }
                .total {
                    font-weight: bold;
                    text-align: right;
                    margin-top: 15px;
                }
                .footer {
                    padding: 15px;
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Thank you for your order!</h2>
                </div>

                <div class="content">
                <p>Hi <strong>${customerName}</strong>,</p>

                <p>
                    Your order <strong>#${orderId}</strong> has been successfully placed.
                </p>

                <table class="order-table">
                    <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${items.map(item => `
                        <tr>
                        <td>${item.title}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.price}</td>
                        </tr>
                    `)}
                    </tbody>
                </table>

                <p class="total">
                    Total Amount: ₹${totalAmount}
                </p>

                <p>
                    <strong>Shipping Address:</strong><br />
                    ${shippingAddress}
                </p>

                <p>
                    We’ll notify you once your order is shipped.
                </p>
                </div>

                <div class="footer">
                © ${year} Pocket Construction. All rights reserved.
                </div>
            </div>
        </body>
    </html>
  `;
};

export default orderEmailTemplate;