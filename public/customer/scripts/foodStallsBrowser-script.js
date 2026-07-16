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
            <div class="foodStall">
              <h3 class="foodStallName">${stall.stall_name}</h3>
              <a class="foodStallId">Stall ID: ${stall.stall_id}</a>
              <a class="foodStallDesc">${stall.description || 'No description available'}</a>
              <a class="foodStallOperateHrs">Operating Hours: ${stall.operating_hours || 'N/A'}</a>
              <a class="foodStallStatus">Status: ${stall.status}</a>
            </div>
          `).join('')
        : `<p class="no-stalls" style="padding: 10px; color: #888;">No stalls registered at this location yet.</p>`;

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