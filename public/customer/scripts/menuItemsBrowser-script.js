const contentContainer = document.querySelector(".content");

async function renderMenuItems() {
  try {
    // 1. Automatically grab the stall_id from the browser's URL query string (?stall_id=X)
    const urlParams = new URLSearchParams(window.location.search);
    const stallId = urlParams.get('stall_id');

    if (!stallId) {
      contentContainer.innerHTML = "<p style='padding: 20px; color: red;'>Error: No stall selected.</p>";
      return;
    }

    const token = localStorage.getItem("token"); 

    // 2. Dynamically plug the real stallId into the URL string (using template literals ``)
    const response = await fetch(`http://localhost:3000/customer/stall/${stallId}`, {
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

    // Because your backend model returns an array from Object.values(),
    // we grab the first item inside it [0] which contains our stall object.
    const resultData = await response.json();
    const stall = resultData[0]; 

    if (!stall) {
      contentContainer.innerHTML = "<p style='padding: 20px;'>No data available for this stall.</p>";
      return;
    }

    // 3. Render the Main Stall header
    contentContainer.innerHTML = `
      <h2 id="contentHeader">${stall.stall_name}</h2>
      <p class="stallStatus" style="margin-bottom: 20px;">Status: <strong>${stall.status}</strong></p>
    `;

    // 4. Loop through the menu_items array belonging to this stall
    const menuItemsHTML = stall.menu_items.length > 0 
      ? stall.menu_items.map(item => `
          <div class="menuItem" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 12px; border-radius: 6px;">
            <h3 class="itemName" style="margin: 0 0 5px 0; color: #333;">${item.item_name}</h3>
            <p class="itemDesc" style="color: #666; margin: 5px 0;">${item.description || 'No description available'}</p>
            <p class="itemPrice" style="font-weight: bold; margin: 5px 0; color: #2c3e50;">
              Price: $${Number(item.price).toFixed(2)}
            </p>
            <p class="itemAvailability" style="margin: 5px 0 0 0; font-size: 0.9em; color: ${item.availability ? 'green' : 'red'};">
              ${item.availability ? '● Available' : '○ Out of Stock'}
            </p>
          </div>
        `).join('')
      : `<p class="no-items" style="padding: 10px; color: darkred;">This stall hasn't added any menu items yet.</p>`;

    // 5. Append the compiled menu list to the container
    contentContainer.insertAdjacentHTML('beforeend', `<div class="menuList">${menuItemsHTML}</div>`);

  } catch (error) {
    console.error("Failed to load menu data from database:", error);
    contentContainer.innerHTML = "<p style='color: red; padding: 20px;'>Error loading menu items. Please try again later.</p>";
  }
}

// Fire off the function automatically when menu.html loads
renderMenuItems();