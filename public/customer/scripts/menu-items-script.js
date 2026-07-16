const contentContainer = document.querySelector(".content");

let isStallOpen = false;
let currentStallId = null;

async function renderMenuItems() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    currentStallId = urlParams.get('stall_id');

    if (!currentStallId) {
      contentContainer.innerHTML = "<p style='padding: 20px; color: red;'>Error: No stall selected.</p>";
      return;
    }

    const token = localStorage.getItem("token"); 

    const response = await fetch(`http://localhost:3000/customer/stall/${currentStallId}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '', 
        'Content-Type': 'application/json'
      }
    }); 

    if (response.status === 401 || response.status === 403) {
      contentContainer.innerHTML = "<p style='color: red; padding: 20px;'>Authentication failed! Please log in again.</p>";
      return;
    }

    if (response.status === 404) {
      contentContainer.innerHTML = "<p style='padding: 20px; color: orange;'>Stall or menu items not found.</p>";
      return;
    }

    const resultData = await response.json();
    const stall = resultData[0]; 

    if (!stall) {
      contentContainer.innerHTML = "<p style='padding: 20px;'>No data available for this stall.</p>";
      return;
    }

    isStallOpen = stall.status && stall.status.toLowerCase() === 'open';
    const statusColor = isStallOpen ? "green" : "red";

    contentContainer.innerHTML = `
      <h2 id="contentHeader">${stall.stall_name}</h2>
      <p class="stallStatus" style="margin-bottom: 20px;">
        Status: <strong style="color: ${statusColor};">${stall.status.toUpperCase()}</strong>
      </p>
    `;

    const menuItemsHTML = stall.menu_items.length > 0 
      ? stall.menu_items.map(item => `
          <div class="menuItem" 
               data-id="${item.menu_item_id}" 
               data-name="${item.item_name}" 
               data-availability="${item.availability}"
               style="border: 1px solid #ddd; padding: 15px; margin-bottom: 12px; border-radius: 6px; cursor: pointer;">
            <h3 class="itemName" style="margin: 0 0 5px 0; color: #333;">${item.item_name}</h3>
            <p class="itemDesc" style="color: #666; margin: 5px 0;">${item.description || 'No description available'}</p>
            <p class="itemPrice" style="font-weight: bold; margin: 5px 0; color: #2c3e50;">
              Price: $${Number(item.price).toFixed(2)}
            </p>
            <p class="itemAvailability" style="margin: 5px 0 0 0; font-size: 0.9em; color: ${item.availability === 'Y' ? 'green' : 'red'};">
              ${item.availability === 'Y' ? '● Available' : '○ Out of Stock'}
            </p>
          </div>
        `).join('')
      : `<p class="no-items" style="padding: 10px; color: darkred;">This stall hasn't added any menu items yet.</p>`;

    contentContainer.insertAdjacentHTML('beforeend', `<div class="menuList">${menuItemsHTML}</div>`);

  } catch (error) {
    console.error("Failed to load menu data from database:", error);
    contentContainer.innerHTML = "<p style='color: red; padding: 20px;'>Error loading menu items. Please try again later.</p>";
  }
}

renderMenuItems();

contentContainer.addEventListener("click", (event) => {
  const clickedItemCard = event.target.closest(".menuItem");
  if (!clickedItemCard) return;

  if (!isStallOpen) {
    alert("This stall is currently closed. You cannot add items to your cart!");
    return;
  }

  const availability = clickedItemCard.dataset.availability;
  if (availability !== 'Y') {
    alert("Sorry, this item is out of stock!");
    return;
  }

  const menuItemId = parseInt(clickedItemCard.dataset.id, 10);
  const itemName = clickedItemCard.dataset.name;

  let cart = JSON.parse(localStorage.getItem("cart")) || { order_items: [] };
  const existingItem = cart.order_items.find(item => item.menu_item_id === menuItemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.order_items.push({
      menu_item_id: menuItemId,
      item_name: itemName, 
      quantity: 1,
      price: Number(clickedItemCard.querySelector('.itemPrice').textContent.replace(/[^0-9.]/g, '')),
      stall_id: parseInt(currentStallId, 10)
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  
  window.location.href = "../html/cart.html"; 
});