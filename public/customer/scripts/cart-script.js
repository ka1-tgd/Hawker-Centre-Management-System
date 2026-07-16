const contentContainer = document.querySelector(".content");
const token = localStorage.getItem("token");

let currentUserId = null;

// Temporary test function to bypass the API block
async function fetchUserAndRenderCart() {
  console.log("Bypassing profile fetch for testing...");
  currentUserId = 8; // Temporarily hardcode user_id as 1 to test
  renderCart();
}

// async function fetchUserAndRenderCart() {
//   if (!token) {
//     contentContainer.innerHTML = `
//       <h2 id="contentHeader">My Cart</h2>
//       <p style="padding: 20px; color: red;">You must be logged in to view your cart.</p>
//       <a href="login.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #e74c3c; color: white; text-decoration: none; border-radius: 4px;">Go to Login</a>
//     `;
//     return;
//   }

//   try {
//     const response = await fetch("http://localhost:3000/profile", {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });

//     if (!response.ok) {
//       throw new Error("Failed to authenticate user profile");
//     }

//     const userData = await response.json();
//     currentUserId = userData.user_id || userData.id; 

//     renderCart();

//   } catch (error) {
//     console.error("Authentication Error:", error);
//     contentContainer.innerHTML = `
//       <h2 id="contentHeader">My Cart</h2>
//       <p style="padding: 20px; color: red;">Session expired. Please log in again to access your cart.</p>
//     `;
//   }
// }

async function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || { order_items: [] };

  if (cart.order_items.length === 0) {
    contentContainer.innerHTML = `
      <h2 id="contentHeader">My Cart</h2>
      <p style="padding: 20px; color: #666;">Your cart is empty!</p>
      <a href="HCs-and-stalls.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #2b3a8f; color: white; text-decoration: none; border-radius: 4px;">Browse Food Stalls</a>
    `;
    return;
  }

  contentContainer.innerHTML = `
    <h2 id="contentHeader">My Cart</h2>
    <div id="cartLoading" style="padding: 20px;">Loading your cart items...</div>
  `;

  try {
    let validatedItems = [];
    let grandTotal = 0;
    let hasClosedStallItem = false;

    for (const item of cart.order_items) {
      try {
        // 1. Fetch the entire stall instead of the individual menu item
        const response = await fetch(`http://localhost:3000/customer/stall/${item.stall_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const resultData = await response.json();
          const stall = resultData[0]; // Get the stall object

          if (stall) {
            // Check if the stall is closed
            const stallStatus = stall.status || 'open';
            const isStallClosed = stallStatus.toLowerCase() !== 'open';
            if (isStallClosed) {
              hasClosedStallItem = true;
            }

            // Find this specific menu item within the stall's menu items array
            const dbItem = stall.menu_items.find(m => m.menu_item_id === item.menu_item_id);

            if (dbItem) {
              const price = Number(dbItem.price || 0);
              const totalItemPrice = price * item.quantity;
              grandTotal += totalItemPrice;

              validatedItems.push({
                ...item,
                price: price,
                totalPrice: totalItemPrice,
                availability: dbItem.availability || 'Y',
                isStallClosed: isStallClosed
              });
            } else {
              // Fallback if the item was deleted from the stall's menu
              throw new Error("Item not found in stall menu");
            }
          } else {
            throw new Error("Stall data empty");
          }
        } else {
          // If the API call fails (e.g. 404 or 500), trigger local fallback
          throw new Error(`API error: ${response.status}`);
        }

      } catch (error) {
        console.warn(`Fallback active for item ${item.menu_item_id}:`, error.message);
        
        // Fallback to saved local storage values so the user is never blocked
        const price = Number(item.price || 0);
        const totalItemPrice = price * item.quantity;
        grandTotal += totalItemPrice;

        validatedItems.push({
          ...item,
          price: price,
          totalPrice: totalItemPrice,
          availability: 'Y',
          isStallClosed: false
        });
      }
    }

    // Render cart items HTML
    let itemsHTML = validatedItems.map(item => {
      // Determine if item should look faded/disabled because of out-of-stock or closed stall
      const isUnavailable = item.availability !== 'Y' || item.isStallClosed;
      
      return `
        <div class="cartItem" data-id="${item.menu_item_id}" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; ${isUnavailable ? 'background-color: #fafafa; border-color: #eca1a1;' : ''}">
          <div>
            <h3 style="margin: 0; color: #333;">${item.item_name}</h3>
            <p style="margin: 5px 0 0 0; color: #666;">
              Price: $${item.price.toFixed(2)} each 
              ${item.availability !== 'Y' ? '<strong style="color:red; display:block; margin-top:2px;">(Out of Stock!)</strong>' : ''}
              ${item.isStallClosed ? '<strong style="color:red; display:block; margin-top:2px;">(Stall is Closed!)</strong>' : ''}
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="qtyBtn descQty" style="padding: 5px 10px; cursor: pointer;">-</button>
              <span style="font-weight: bold; font-size: 1.1em;">${item.quantity}</span>
              <button class="qtyBtn incQty" style="padding: 5px 10px; cursor: pointer;">+</button>
            </div>
            <p style="font-weight: bold; width: 80px; text-align: right;">$${item.totalPrice.toFixed(2)}</p>
          </div>
        </div>
      `;
    }).join('');

    // 1. Get the stall_id of the first item in the cart (so we can return to the exact same stall menu)
    const firstCartItem = cart.order_items[0];
    const backToMenuUrl = firstCartItem 
      ? `menu-items.html?stall_id=${firstCartItem.stall_id || ''}` // Go back to the stall menu
      : "HCs-and-stalls.html"; // Fallback to list of stalls if cart is empty

    // 2. Generate cart summary with the new "Add More Items" button
    const cartSummaryHTML = `
      <div class="cartList">${itemsHTML}</div>
      
      <div class="cartSummary" style="margin-top: 25px; padding: 20px; border-top: 2px solid #eee; background-color: #f9f9f9; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 1.2em; font-weight: bold;">
          <span>Grand Total:</span>
          <span style="color: #2c3e50;">$${grandTotal.toFixed(2)}</span>
        </div>

        <div style="margin-bottom: 20px;">
          <label for="paymentType" style="display: block; font-weight: bold; margin-bottom: 5px;">Select Payment Method:</label>
          <select id="paymentType" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
            <option value="Cash">Cash</option>
            <option value="Card">Credit/Debit Card</option>
            <option value="PayNow">PayNow</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          
          <button onclick="window.location.href='${backToMenuUrl}'" style="width: 100%; padding: 12px; background: #34495e; color: white; font-weight: bold; border: none; border-radius: 4px; font-size: 1.1em; cursor: pointer;">
            ← Add More Items
          </button>

          ${hasClosedStallItem ? `
            <button id="checkoutBtn" disabled style="width: 100%; padding: 12px; background: #95a5a6; color: white; font-weight: bold; border: none; border-radius: 4px; font-size: 1.1em; cursor: not-allowed;">
              Stall Closed (Remove items to order)
            </button>
          ` : `
            <button id="checkoutBtn" style="width: 100%; padding: 12px; background: #27ae60; color: white; font-weight: bold; border: none; border-radius: 4px; font-size: 1.1em; cursor: pointer;">
              Place Order ($${grandTotal.toFixed(2)})
            </button>
          `}
          
        </div>
      </div>
    `;

    document.getElementById("cartLoading")?.remove();
    contentContainer.insertAdjacentHTML('beforeend', cartSummaryHTML);

    setupCartEventListeners();

  } catch (error) {
    console.error("Error displaying cart:", error);
    contentContainer.innerHTML = "<p style='color: red; padding: 20px;'>Error rendering cart items.</p>";
  }
}

let listenersAttached = false;

function setupCartEventListeners() {
  if (listenersAttached) return;
  contentContainer.addEventListener("click", (e) => {
    const btn = e.target;
    if (!btn.classList.contains("qtyBtn")) return;

    const cartItemEl = btn.closest(".cartItem");
    const itemId = parseInt(cartItemEl.dataset.id, 10);
    let cart = JSON.parse(localStorage.getItem("cart"));
    const cartItem = cart.order_items.find(i => i.menu_item_id === itemId);

    if (btn.classList.contains("incQty")) {
      cartItem.quantity += 1;
    } else if (btn.classList.contains("descQty")) {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        cart.order_items = cart.order_items.filter(i => i.menu_item_id !== itemId);
      }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  });

  const checkoutBtn = document.getElementById("checkoutBtn");
  // Only add submit event listener if the button isn't disabled (i.e. checkoutBtn exists and is not disabled)
  if (checkoutBtn && !checkoutBtn.disabled) {
    checkoutBtn.addEventListener("click", async () => {
      const paymentType = document.getElementById("paymentType").value;
      const cart = JSON.parse(localStorage.getItem("cart"));

      const orderPayload = {
        user_id: parseInt(currentUserId, 10), 
        payment_type: paymentType,
        order_items: cart.order_items.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity
        }))
      };

      try {
        checkoutBtn.disabled = true;
        checkoutBtn.innerText = "Processing Order...";

        const response = await fetch("http://localhost:3000/customer/orders", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        });

        const responseData = await response.json();

        if (response.ok) {
          alert("Order Placed Successfully!");
          localStorage.removeItem("cart");
          window.location.href = "my-orders.html";
        } else {
          alert(`Order Failed: ${responseData.message || "Please try again."}`);
          checkoutBtn.disabled = false;
          checkoutBtn.innerText = "Place Order";
        }
      } catch (error) {
        console.error("Checkout Error:", error);
        alert("Failed to submit order. Connection error.");
        checkoutBtn.disabled = false;
        checkoutBtn.innerText = "Place Order";
      }
    });
  }

  listenersAttached = true;
}

fetchUserAndRenderCart();