document.addEventListener("DOMContentLoaded", () => {
  const contentContainer = document.querySelector(".content");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  let currentStallId = null;  //To keep track of current'order's stall, to endure can only add new order item from the same stall only.

  function initializeUserAccount() {
    if (!token || role !== "customer") {
      contentContainer.innerHTML = `
        <h2 id="contentHeader">Order Items</h2>
        <p style="padding: 20px; color: red;">You must be logged in as a customer to view order details.</p>
        <a href="../../login.html" style="display: inline-block; margin-left: 20px; padding: 10px 15px; background: #2b3a8f; color: white; text-decoration: none; border-radius: 4px;">Go to Login</a>
      `;
      return false;
    }

    const welcomeMessage = document.getElementById("welcomeUser"); 
    if (welcomeMessage && username) {
      welcomeMessage.textContent = `Welcome, ${username}!`;
    }
    return true;
  }

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

  if (initializeUserAccount()) {
    fetchAndRenderOrderDetails();
    setupEventHandlers(); // Mount operations event hub
  }

  async function fetchAndRenderOrderDetails() {
    contentContainer.innerHTML = `
      <h2 id="contentHeader">Order Items</h2>
      <p style="padding: 20px; color: #666;">Loading order details...</p>
    `;

    try {
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
      const order = resultData[0];

      if (!order) {
        contentContainer.innerHTML = `
          <h2 id="contentHeader">Order Items</h2>
          <p style="padding: 20px; color: orange;">Order details not found.</p>
        `;
        return;
      }

      // Normalized status matching your exact backend output string ('Pending')
      const rawStatus = order.status || 'Pending';
      const isPending = rawStatus === 'Pending';

      // Safe stall_id extraction from nested object collection array
      if (order.order_items && order.order_items.length > 0) {
        currentStallId = order.order_items[0].stall_id || null;
      } else {
        currentStallId = order.stall_id || null;
      }

      console.log("=== Debugging Add Item Form Trigger ===");
      console.log("Is Order Status Pending?:", isPending, `(Value: "${rawStatus}")`);
      console.log("Found Stall ID Variable?:", currentStallId);

      // Status color matching setup
      let statusColor = '#ffbf00'; // Pending
      if (rawStatus === 'Preparing') statusColor = '#ff7f50';
      if (rawStatus === 'Completed') statusColor = '#27ae60';
      if (rawStatus === 'Cancelled') statusColor = '#c0392b';

      // 1. Build the list rows text template
      let itemsHTML = '';
      if (order.order_items && order.order_items.length > 0) {
        itemsHTML = order.order_items.map(item => {
          const itemTotal = Number(item.unit_price) * item.quantity;
          
          const controlInterface = isPending 
            ? `
              <div style="display: flex; align-items: center; gap: 10px;">
                <button class="btn-qty-minus" data-item-no="${item.order_item_no}" data-qty="${item.quantity}" style="padding: 2px 8px; font-weight: bold; cursor: pointer; border: 1px solid #ccc; background: #f0f0f0; border-radius: 4px;">-</button>
                <span style="color: #333; font-weight: bold; min-width: 20px; text-align: center;">${item.quantity}</span>
                <button class="btn-qty-plus" data-item-no="${item.order_item_no}" data-qty="${item.quantity}" style="padding: 2px 8px; font-weight: bold; cursor: pointer; border: 1px solid #ccc; background: #f0f0f0; border-radius: 4px;">+</button>
              </div>
              <button class="btn-delete" data-item-no="${item.order_item_no}" style="padding: 5px 10px; background: #c0392b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Delete</button>
            `
            : `<span style="color: #666; font-weight: bold;">Qty: ${item.quantity}</span>`;

          return `
            <div class="orderItemRow" style="border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="margin: 0; color: #333; font-size: 1.1em;">${item.item_name}</h4>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9em;">Unit Price: $${Number(item.unit_price).toFixed(2)}</p>
              </div>
              <div style="display: flex; align-items: center; gap: 20px;">
                ${controlInterface}
                <span style="font-weight: bold; width: 70px; text-align: right; color: #2c3e50;">$${itemTotal.toFixed(2)}</span>
              </div>
            </div>
          `;
        }).join('');
      } else {
        itemsHTML = `<p style="padding: 20px; color: #888; text-align: center;">No items found in this order.</p>`;
      }

      // 2. Build the Add Item Form HTML snippet if order status is eligible
      let addItemInterfaceHTML = '';
      if (isPending) {
        addItemInterfaceHTML = `
          <div class="addItemContainer" style="margin-top: 25px; padding: 20px; border: 1px dashed #2b3a8f; border-radius: 6px; background: #fcfdfe;">
            <h4 style="margin: 0 0 15px 0; color: #2b3a8f;">+ Add Another Item to this Order</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center;">
              <div style="flex: 1; min-width: 200px;">
                <select id="stallMenuDropdown" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                  <option value="">Loading hawker items...</option>
                </select>
              </div>
              <div style="width: 90px;">
                <input type="number" id="addItemQty" value="1" min="1" style="width: 100%; padding: 7px; border-radius: 4px; border: 1px solid #ccc; text-align: center;" />
              </div>
              <button id="btnConfirmAddItem" style="padding: 8px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Add Item</button>
            </div>
          </div>
        `;
      }

      // 3. Assemble all generated sub-components directly into the complete view string
      const fullLayoutHTML = `
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
              <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #777;">Placed: ${new Date(order.order_date).toLocaleString()}</p>
            </div>
            <span style="background: ${statusColor}; color: white; padding: 6px 15px; border-radius: 20px; font-size: 0.9em; font-weight: bold;">
              ${rawStatus}
            </span>
          </div>

          <div style="margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px 0; color: #555; border-bottom: 1px solid #eee; padding-bottom: 10px;">Items List</h4>
            <div>
              ${itemsHTML}
            </div>
            ${addItemInterfaceHTML}
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

      // 4. Inject structure into the live DOM layout node
      contentContainer.innerHTML = `
        <h2 id="contentHeader">Order Items</h2>
        ${fullLayoutHTML}
      `;

      // 5. Populate dropdown menu now that elements exist in the DOM
      if (isPending && currentStallId) {
        populateMenuDropdown(currentStallId);
      }

    } catch (error) {
      console.error("Failed to load order details:", error);
      contentContainer.innerHTML = `
        <h2 id="contentHeader">Order Items</h2>
        <p style="padding: 20px; color: red;">Failed to retrieve your order details.</p>
      `;
    }
  }

  // --- GET MENU FOR DROPDOWN ---
  async function populateMenuDropdown(stallId) {
    const dropdown = document.getElementById("stallMenuDropdown");
    if (!dropdown) return;

    try {
      console.log(`📡 Fetching items for Stall ID: ${stallId}...`);
      
      const response = await fetch(`http://localhost:3000/customer/stall/${stallId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const result = await response.json();
      console.log("📦 Raw Stall Menu Response Payload:", result);

      // 🎯 TARGETED FIX: Unpack the nested array safely from the parent wrapper
      // Checks both array wrapper index [0] or direct object properties
      const stallData = Array.isArray(result) ? result[0] : result;
      const menuItems = stallData ? stallData.menu_items : null;

      if (!menuItems || menuItems.length === 0) {
        dropdown.innerHTML = `<option value="">No items available from this stall</option>`;
        return;
      }

      console.log("🥞 Found Nested Dishes List:", menuItems);

      dropdown.innerHTML = `<option value="">-- Select a dish to add --</option>` + 
        menuItems
          // Filters for operational/available items
          .filter(item => !item.availability || item.availability.toUpperCase() === 'Y')
          .map(item => {
            // Mapping keys matching your specific inner dish data structure
            const itemId = item.menu_item_id || item.item_id || item.id;
            const itemName = item.item_name || item.name || "Unnamed Dish";
            const itemPrice = item.price || item.unit_price || 0;
            
            return `<option value="${itemId}">${itemName} ($${Number(itemPrice).toFixed(2)})</option>`;
          })
          .join('');

    } catch (err) {
      console.error("❌ Dropdown building crashed:", err);
      dropdown.innerHTML = `<option value="">Failed to load vendor inventory</option>`;
    }
  }

  // --- INTERACTION LAYER CONTROLLERS ---

  function setupEventHandlers() {
    contentContainer.addEventListener("click", async (e) => {
      // 1. Handle Quantity Decrement (-)
      if (e.target.classList.contains("btn-qty-minus")) {
        const itemNo = e.target.dataset.itemNo;
        const currentQty = parseInt(e.target.dataset.qty, 10);
        
        if (currentQty <= 1) {
          // If customer hits minus at quantity 1, redirect them to delete operation instead
          if (confirm("Would you like to completely remove this item from your order?")) {
            await executeDeleteAction(itemNo);
          }
        } else {
          await executeUpdateQuantityAction(itemNo, currentQty - 1);
        }
      }

      // 2. Handle Quantity Increment (+)
      if (e.target.classList.contains("btn-qty-plus")) {
        const itemNo = e.target.dataset.itemNo;
        const currentQty = parseInt(e.target.dataset.qty, 10);
        await executeUpdateQuantityAction(itemNo, currentQty + 1);
      }

      // 3. Handle Direct Delete Action
      if (e.target.classList.contains("btn-delete")) {
        const itemNo = e.target.dataset.itemNo;
        if (confirm("Are you sure you want to remove this item?")) {
          await executeDeleteAction(itemNo);
        }
      }

      if (e.target.id === "btnConfirmAddItem") {
        const dropdown = document.getElementById("stallMenuDropdown");
        const qtyInput = document.getElementById("addItemQty");

        if (!dropdown || !qtyInput) return;

        const menuItemId = dropdown.value;
        const quantity = parseInt(qtyInput.value, 10);

        if (!menuItemId) {
          alert("Please pick a menu item first.");
          return;
        }
        if (isNaN(quantity) || quantity <= 0) {
          alert("Please enter a valid quantity of 1 or more.");
          return;
        }

        await executeAddItemAction(menuItemId, quantity);
      }
    });
  }

  async function executeAddItemAction(menuItemId, quantity) {
    try {
      // Maps cleanly to your route: app.post("/customer/orders/items", ...)
      const response = await fetch(`http://localhost:3000/customer/orders/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: parseInt(orderId, 10),
          menu_item_id: parseInt(menuItemId, 10),
          quantity: quantity
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add item to your order.");
        } else {
          throw new Error(`Server Error: Received status code ${response.status}.`);
        }
      }

      // Repaint the updated interface elements seamlessly
      await fetchAndRenderOrderDetails();
    } catch (err) {
      alert(err.message);
      console.error("Item insertion failure:", err);
    }
  }

  async function executeUpdateQuantityAction(itemNo, newQty) {
    try {
      const response = await fetch(`http://localhost:3000/customer/orders/${orderId}/items/${itemNo}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQty }) 
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update item count.");
        } else {
          throw new Error(`Server Error: Received status code ${response.status}.`);
        }
      }
      
      await fetchAndRenderOrderDetails(); 
    } catch (err) {
      alert(err.message);
      console.error("Quantity modification failure:", err);
    }
  }

  async function executeDeleteAction(itemNo) {
    try {
      const response = await fetch(`http://localhost:3000/customer/orders/${orderId}/items/${itemNo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove the selected item.");
        } else {
          throw new Error(`Server Error: Received status code ${response.status}.`);
        }
      }

      await fetchAndRenderOrderDetails(); 
    } catch (err) {
      alert(err.message);
      console.error("Item deletion failure:", err);
    }
  }
});