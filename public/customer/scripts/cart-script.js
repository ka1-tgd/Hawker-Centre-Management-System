function renderCartPage() {
  const contentContainer = document.querySelector(".content");
  
  if (!contentContainer) {
    console.error("CRITICAL ERROR: Could not find the element with class '.content' on this page!");
    return;
  }

  console.log("SUCCESS: .content container found. Reading localStorage...");

  const cart = JSON.parse(localStorage.getItem("cart")) || { order_items: [] };
  console.log("Current cart data retrieved:", cart);

  if (!cart.order_items || cart.order_items.length === 0) {
    console.log("Cart is empty. Rendering empty message.");
    contentContainer.insertAdjacentHTML(
      'beforeend',
      `<p class="empty-message" style="padding: 20px; color: #666; font-style: italic;">Your cart is empty. Go back to the menu to add delicious food!</p>`
    );
    return;
  }

  console.log(`Cart has ${cart.order_items.length} unique items! Commencing HTML generation...`);

  const cartItemsHTML = cart.order_items.map(item => `
    <div class="cartItem" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #eee;">
      <div>
        <h4 style="margin: 0 0 5px 0; color: #333; font-size: 1.1em;">${item.item_name}</h4>
        <span style="color: #666; font-size: 0.9em;">Quantity: <strong>x${item.quantity}</strong></span>
      </div>
    </div>
  `).join('');

  const checkoutSectionHTML = `
    <div class="cartList" style="margin-top: 20px;">
      ${cartItemsHTML}
    </div>

    <div class="payment-selection" style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-radius: 6px;">
      <label for="paymentType" style="font-weight: bold; color: #333;">Payment Method: </label>
      <select id="paymentType" style="padding: 6px 10px; margin-left: 10px; border-radius: 4px; border: 1px solid #ccc;">
        <option value="Cash">Cash</option>
        <option value="Credit Card">Credit Card</option>
        <option value="GrabPay">GrabPay</option>
      </select>
    </div>

    <button id="placeOrderBtn" style="background: #ff5722; color: white; font-size: 1.2em; padding: 12px 20px; border: none; margin-top: 20px; cursor: pointer; width: 100%; border-radius: 6px; font-weight: bold;">
      Confirm & Place Order
    </button>
  `;

  contentContainer.insertAdjacentHTML('beforeend', checkoutSectionHTML);
  console.log("HTML successfully injected into DOM container layout.");

  setupOrderSubmission();
}

function setupOrderSubmission() {
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const paymentTypeSelect = document.getElementById("paymentType");

  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click", async () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart"));
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id") || 1; 

      const orderPayload = {
        user_id: parseInt(userId, 10),
        payment_type: paymentTypeSelect.value,
        order_items: cart.order_items.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity
        }))
      };

      placeOrderBtn.disabled = true;
      placeOrderBtn.innerText = "Processing Your Order...";

      const response = await fetch("http://localhost:3000/customer/order", {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : '',
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const finishedOrder = await response.json();
        alert("Order placed successfully!");
        localStorage.removeItem("cart");
        window.location.href = `order-success.html?order_id=${finishedOrder.order_id}`;
      } else {
        const errorData = await response.json();
        alert(`Failed to place order: ${errorData.message || 'Server error'}`);
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerText = "Confirm & Place Order";
      }
    } catch (error) {
      console.error("Checkout Request Error:", error);
      alert("An error occurred during checkout. Please try again later.");
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerText = "Confirm & Place Order";
    }
  }); 
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
});