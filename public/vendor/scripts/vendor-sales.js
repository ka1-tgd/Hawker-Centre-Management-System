const apiBaseUrl = "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

async function loadPopularItemsChart(stallId) {
  const chartContainer = document.getElementById("popularItemsChart");

  try {
    const response = await fetch(`${apiBaseUrl}/vendor/sales/${stallId}/chart`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chart");
    }

    const result = await response.json();
    chartContainer.innerHTML = `<img src="${result.chartUrl}" alt="Top Selling Items Chart" style="max-width:100%;">`;

  } catch (error) {
    console.error("Error loading chart:", error);
    chartContainer.innerHTML = "<p>Chart unavailable.</p>";
  }
}

async function loadSalesDashboard() {
  try {
    // Step 1: get the logged in vendor's stall
    const stallResponse = await fetch(`${apiBaseUrl}/vendor/stalls`, {
      headers: getAuthHeaders(),
    });

    if (!stallResponse.ok) {
      throw new Error("Failed to fetch vendor stall");
    }

    const stalls = await stallResponse.json();

    if (!stalls || stalls.length === 0) {
      document.querySelector(".container").innerHTML += "<p>No stall found for this vendor.</p>";
      return;
    }

    const stallId = stalls[0].stall_id;

    // Step 2: load the 3 sales endpoints using that stall id
    await loadRevenueSummary(stallId);
    await loadPopularItems(stallId);
    await loadPeakHours(stallId);
    await loadPopularItemsChart(stallId);

  } catch (error) {
    console.error("Error loading sales dashboard:", error);
  }
}

async function loadRevenueSummary(stallId) {
  try {
    const response = await fetch(`${apiBaseUrl}/vendor/sales/${stallId}/revenue`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch revenue summary");
    }

    const summary = await response.json();

    const totalRevenue = summary.total_revenue || 0;
    const totalOrders = summary.total_orders || 0;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    document.getElementById("totalRevenue").textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById("totalOrders").textContent = totalOrders;
    document.getElementById("avgOrderValue").textContent = `$${avgOrderValue.toFixed(2)}`;

  } catch (error) {
    console.error("Error loading revenue summary:", error);
  }
}

async function loadPopularItems(stallId) {
  const tableBody = document.getElementById("popularItemsBody");

  try {
    const response = await fetch(`${apiBaseUrl}/vendor/sales/${stallId}/popular-items`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch popular items");
    }

    const items = await response.json();

    tableBody.innerHTML = "";

    if (items.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='2' style='padding:15px;'>No sales data yet.</td></tr>";
      return;
    }

    items.forEach((item) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #f0f0f0";
      tr.innerHTML = `
        <td style="padding:15px;">${item.item_name}</td>
        <td style="padding:15px;">${item.total_quantity}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error loading popular items:", error);
  }
}

async function loadPeakHours(stallId) {
  const tableBody = document.getElementById("peakHoursBody");

  try {
    const response = await fetch(`${apiBaseUrl}/vendor/sales/${stallId}/peak-hours`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch peak hours");
    }

    const hours = await response.json();

    tableBody.innerHTML = "";

    if (hours.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='2' style='padding:15px;'>No order data yet.</td></tr>";
      return;
    }

    hours.forEach((row) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #f0f0f0";
      tr.innerHTML = `
        <td style="padding:15px;">${row.hour_of_day}:00</td>
        <td style="padding:15px;">${row.order_count}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error loading peak hours:", error);
  }
}

loadSalesDashboard();