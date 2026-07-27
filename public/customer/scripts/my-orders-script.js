document.addEventListener("DOMContentLoaded", () => {
  const contentContainer = document.querySelector(".content");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  function initializeUserAccount() {
    if (!token || role !== "customer") {
      contentContainer.innerHTML = `
        <h2 id="contentHeader">Order Records</h2>
        <p style="padding: 20px; color: red;">You must be logged in as a customer to view your orders.</p>
        <a href="../../login.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #2b3a8f; color: white; text-decoration: none; border-radius: 4px;">Go to Login</a>
      `;
      return false; //Verification failed
    }

    const welcomeMessage = document.getElementById("welcomeUser"); 
    if (welcomeMessage && username) {
      welcomeMessage.textContent = `Welcome, ${username}!`;
    }
    return true; //Verification passed
  }

  if (initializeUserAccount()) {
    fetchAndRenderOrders();
  }

  async function fetchAndRenderOrders() {
    contentContainer.innerHTML = `
      <h2 id="contentHeader">Order Records</h2>
      <p style="padding: 20px; color: #666;">Loading your order history...</p>
    `;

    try {
      const response = await fetch(`http://localhost:3000/customer/orders/${userId}`, {
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
      const userProfile = resultData[0]; 
      const orders = userProfile && userProfile.orders ? userProfile.orders : [];

      if (orders.length === 0) {
        contentContainer.innerHTML = `
          <h2 id="contentHeader">Order Records</h2>
          <p style="padding: 20px; color: #666;">You haven't placed any orders yet!</p>
          <a href="HCs-and-stalls.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #2b3a8f; color: white; text-decoration: none; border-radius: 4px;">Order Food Now</a>
        `;
        return;
      }

      const ordersHTML = orders.map(order => {
        const orderDate = new Date(order.order_date).toLocaleString();
        const status = (order.status || 'Pending').toUpperCase();
        let statusColor = '#ffbf00';
        if (status === 'PREPARING') statusColor = '#ff7f50';
        if (status === 'COMPLETED' || status === 'DELIVERED') statusColor = '#27ae60';
        if (status === 'CANCELLED') statusColor = '#c0392b';

        //cancel button, only show if the order status is 'Pending'.
        const showCancelButton = status === 'PENDING' 
          ? `<button class="cancel-order-btn" data-id="${order.order_id}" style="background-color: #f11800; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.85em;">Cancel Order</button>`
          : '';

        return `
          <div class="orderCard" 
               onclick="window.location.href='my-order-items.html?order_id=${order.order_id}'"
               style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.shadow='0 4px 8px rgba(0,0,0,0.1)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.shadow='0 2px 4px rgba(0,0,0,0.05)';">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f4f4f4; padding-bottom: 10px; margin-bottom: 15px;">
              <div>
                <h3 style="margin: 0; color: #2b3a8f;">Order #${order.order_id}</h3>
                <span style="font-size: 0.85em; color: #888;">Placed on: ${orderDate}</span>
              </div>
              <span style="background: ${statusColor}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">
                ${status}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: #fafafa; padding: 12px; border-radius: 4px; font-weight: bold;">
              <span style="color: #555;">Payment Method: <span style="font-weight: normal; color: #333;">${order.payment_type || 'Cash'}</span></span>
              <span style="font-size: 1.1em; color: #2c3e50;">Total: $${Number(order.total_amount || 0).toFixed(2)}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
              <div>                                                                        
                ${showCancelButton}
              </div>
              <div style="text-align: right; margin-top: 10px; font-size: 0.85em; color: #2b3a8f; font-weight: bold;">
                View Details →
              </div>
            </div>
          </div>
        `;
      }).join('');

      contentContainer.innerHTML = `
        <h2 id="contentHeader">Order Records</h2>
        <div class="ordersList" style="padding: 10px 0;">
          ${ordersHTML}
        </div>
      `;

      setupCancelButtonListeners();

    } catch (error) {
      console.error("Failed to load orders:", error);
      contentContainer.innerHTML = `
        <h2 id="contentHeader">Order Records</h2>
        <p style="padding: 20px; color: red;">Failed to retrieve your order history. Please try again later.</p>
      `;
    }
  }

  function setupCancelButtonListeners() {
    const cancelButtons = document.querySelectorAll(".cancel-order-btn");
    
    cancelButtons.forEach(button => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const orderId = button.getAttribute("data-id");
        if (confirm(`Are you sure you want to cancel Order #${orderId}?`)) {
          try {
            const response = await fetch(`http://localhost:3000/customer/orders/${orderId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              alert("Order successfully cancelled!");
              fetchAndRenderOrders();
            } else {
              const errData = await response.json();
              alert(`Error: ${errData.message || 'Could not cancel order.'}`);
            }
          } catch (err) {
            console.error("Error cancelling order:", err);
            alert("Failed to connect to server. Try again later.");
          }
        }
      });
    });
  }

  fetchAndRenderOrders();
});