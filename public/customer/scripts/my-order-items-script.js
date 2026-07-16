document.addEventListener("DOMContentLoaded", () => {
  const contentContainer = document.querySelector(".content");
  const token = localStorage.getItem("token");

  // 1. Authentication Check
  if (!token) {
    contentContainer.innerHTML = `
      <h2 id="contentHeader">Order Items</h2>
      <p style="padding: 20px; color: red;">You must be logged in to view order details.</p>
      <a href="login.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #2b3a8f; color: white; text-decoration: none; border-radius: 4px;">Go to Login</a>
    `;
    return;
  }

  // 2. Extract order_id from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');

  if (!orderId) {
    contentContainer.innerHTML = `
      <h2 id="contentHeader">Order Items</h2>
      <p style="padding: 20px; color: red;">Error: No order selected.</p>
      <a href="my-orders.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #34495e; color: white; text-decoration: none; border-radius: 4px;">Back to My Orders</a>
    `;
    return;
  }

  async function fetchAndRenderOrderDetails() {
    contentContainer.innerHTML = `
      <h2 id="contentHeader">Order Items</h2>
      <p style="padding: 20px; color: #666;">Loading order details...</p>
    `;

    try {
      // 3. Fetch specific order details
      const response = await fetch(`http://localhost:3000/customer/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const resultData = await response.json();
      const order = resultData[0]; // Extract the order object

      if (!order) {
        contentContainer.innerHTML = `
          <h2 id="contentHeader">Order Items</h2>
          <p style="padding: 20px; color: orange;">Order details not found.</p>
          <a href="my-orders.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #34495e; color: white; text-decoration: none; border-radius: 4px;">Back to My Orders</a>
        `;
        return;
      }

      // Format elements
      const orderDate = new Date(order.order_date).toLocaleString();
      const status = (order.status || 'Pending').toUpperCase();
      let statusColor = '#ffbf00';
      if (status === 'PREPARING') statusColor = '#ff7f50';
      if (status === 'COMPLETED' || status === 'DELIVERED') statusColor = '#27ae60';
      if (status === 'CANCELLED') statusColor = '#c0392b';

      // 4. Map the order_items inside the payload
      const itemsHTML = order.order_items && order.order_items.length > 0
        ? order.order_items.map(item => {
            const itemTotal = Number(item.unit_price) * item.quantity;
            return `
              <div class="orderItemRow" style="border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="margin: 0; color: #333; font-size: 1.1em;">${item.item_name}</h4>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9em;">
                    Unit Price: $${Number(item.unit_price).toFixed(2)}
                  </p>
                </div>
                <div style="display: flex; align-items: center; gap: 30px;">
                  <span style="color: #666; font-weight: bold;">Qty: ${item.quantity}</span>
                  <span style="font-weight: bold; width: 70px; text-align: right; color: #2c3e50;">$${itemTotal.toFixed(2)}</span>
                </div>
              </div>
            `;
          }).join('')
        : `<p style="padding: 20px; color: #888; text-align: center;">No items found in this order.</p>`;

      // 5. Generate full detailed display
      const detailHTML = `
        <div style="margin-bottom: 20px;">
          <a href="my-orders.html" style="text-decoration: none; color: #2b3a8f; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;">
            ← Back to All Orders
          </a>
        </div>

        <div class="orderDetailCard" style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f4f4f4; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
              <h3 style="margin: 0 0 5px 0; color: #2b3a8f; font-size: 1.4em;">Order Details</h3>
              <p style="margin: 0; font-size: 0.9em; color: #777;">Order ID: #${orderId}</p>
              <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #777;">Placed: ${orderDate}</p>
            </div>
            <span style="background: ${statusColor}; color: white; padding: 6px 15px; border-radius: 20px; font-size: 0.9em; font-weight: bold;">
              ${status}
            </span>
          </div>

          <div style="margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px 0; color: #555; border-bottom: 1px solid #eee; padding-bottom: 10px;">Items List</h4>
            <div>
              ${itemsHTML}
            </div>
          </div>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 6px; border: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #555;">
              <span>Payment Type:</span>
              <span style="font-weight: bold; color: #333;">${order.payment_type || 'Cash'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.3em; font-weight: bold; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 15px;">
              <span style="color: #333;">Grand Total:</span>
              <span style="color: #27ae60;">$${Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;

      contentContainer.innerHTML = `
        <h2 id="contentHeader">Order Items</h2>
        ${detailHTML}
      `;

    } catch (error) {
      console.error("Failed to load order details:", error);
      contentContainer.innerHTML = `
        <h2 id="contentHeader">Order Items</h2>
        <p style="padding: 20px; color: red;">Failed to retrieve your order details. Please try again later.</p>
        <a href="my-orders.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #34495e; color: white; text-decoration: none; border-radius: 4px;">Back to My Orders</a>
      `;
    }
  }

  fetchAndRenderOrderDetails();
});