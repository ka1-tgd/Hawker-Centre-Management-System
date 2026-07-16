const contentContainer = document.querySelector(".content");

async function renderHawkerCentres() {
  try {
    // 1. DYNAMICALLY pull the active token from the browser's storage
    const token = localStorage.getItem("token"); 

    // 2. Fetch data from your backend
    const response = await fetch('http://localhost:3000/customer/hawkerCentres/with-stalls', {
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

    const hawkerCentres = await response.json();
    contentContainer.innerHTML = '<h2 id="contentHeader">Hawker Centres</h2>';

    hawkerCentres.forEach((centre) => {
      const stallsHTML = centre.stalls.length > 0 
        ? centre.stalls.map(stall => `
            <div class="foodStall" data-stall-id="${stall.stall_id}" style="cursor: pointer;">
              <h3 class="foodStallName">${stall.stall_name}</h3>
              <span class="foodStallDesc">${stall.description || 'No description available'}</span>
              <span class="foodStallOperateHrs">Operating Hours: ${stall.operating_hours || 'N/A'}</span>
              <span class="foodStallStatus">Status: ${stall.status}</span>
            </div>
          `).join('')
        : `<p class="no-stalls" style="padding: 10px; color: darkred;">No stalls registered at this location yet.</p>`;

      const centreHTML = `
        <div class="hawkerCentre" data-id="${centre.hawker_centre_id}">
          <h2 class="hawkerCentreName">${centre.hawker_centre_name}</h2>
          <a class="hawkerCentreAddress">Location: ${centre.hawker_centre_address}</a>
          <div class="foodStalls">
            ${stallsHTML}
          </div>
        </div>
      `;
      contentContainer.insertAdjacentHTML('beforeend', centreHTML);
    });

  } catch (error) {
    console.error("Failed to load hawker data from database:", error);
    contentContainer.innerHTML = "<p style='color: red; padding: 20px;'>Error loading hawker data. Please try again later.</p>";
  }
}

renderHawkerCentres();

// 2. Add the automatic click-to-navigate handler below it
contentContainer.addEventListener("click", (event) => {
  // Find the closest parent element with the class '.foodStall'
  const clickedStallCard = event.target.closest(".foodStall");
  
  // If the user didn't click on a stall card (e.g. they clicked the header), do nothing
  if (!clickedStallCard) return;

  // Automatically grab the ID from the data attribute we set up
  const stallId = clickedStallCard.dataset.stallId;

  if (stallId) {
    // Redirect them to the menu page with the ID tucked quietly in the URL
    window.location.href = `customer-menuItemsBrowser.html?stall_id=${stallId}`;
  }
});