const contentContainer = document.querySelector(".content");

const TEST_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzg0MTgwMjkxLCJleHAiOjE3ODQxODM4OTF9.yNzcXqth6rif5kU4dbnrHK9Vc_Yj8ON8xCbkVXyieBE";
const cors = require('cors');
app.use(cors());


async function renderHawkerCentres() {
  try {
    // 2. Add the headers object to send your token to the backend
    const response = await fetch('http://localhost:3000/customer/hawkerCentres/with-stalls', {
      method: 'GET',
      headers: {
        'Authorization': TEST_TOKEN, // Passes your token along with the request
        'Content-Type': 'application/json'
      }
    }); 

    // Handle authentication errors explicitly so you know if the token expired
    if (response.status === 401 || response.status === 403) {
      contentContainer.innerHTML += "<p style='color: red; padding: 20px;'>Authentication failed! Check your TEST_TOKEN.</p>";
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
    contentContainer.innerHTML += "<p style='color: red; padding: 20px;'>Error loading hawker data. Please try again later.</p>";
  }
}

renderHawkerCentres();