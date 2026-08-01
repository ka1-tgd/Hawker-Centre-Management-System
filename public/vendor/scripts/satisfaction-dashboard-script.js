// The login token saved by login.js after a successful login - must be a hawker
const token = localStorage.getItem("token");

const ratingSummaryEl = document.getElementById("ratingSummary");
const ratingSummarySubtextEl = document.getElementById("ratingSummarySubtext");
const ratingBreakdownCanvas = document.getElementById("ratingBreakdownChart");
const ratingTrendCanvas = document.getElementById("ratingTrendChart");
const recentFeedbackDiv = document.getElementById("recentFeedback");
const complaintSummaryDiv = document.getElementById("complaintSummary");
const pageLabel = document.getElementById("pageLabel");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const messageDiv = document.getElementById("message");

// Chart.js instances 
let ratingBreakdownChart = null;
let ratingTrendChart = null;

const CHART_GREEN = "#8fd6ab";

let currentPage = 1;
let lastRecentFeedbackCount = 0;
let stallId = null;

// Find the logged-in vendor's own stall, instead of hardcoding one 
async function loadVendorStall() {
  try {
    const response = await fetch("/vendor/stalls", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      messageDiv.textContent = "Authentication failed! Please login as a hawker.";
      messageDiv.style.color = "red";
      return false;
    }

    const stalls = await response.json();

    if (!stalls || stalls.length === 0) {
      messageDiv.textContent = "You don't have a stall set up yet.";
      messageDiv.style.color = "red";
      return false;
    }

    stallId = stalls[0].stall_id;
    return true;
  } catch (error) {
    console.error(error);
    messageDiv.textContent = "Failed to load your stall";
    messageDiv.style.color = "red";
    return false;
  }
}

// Load the full satisfaction dashboard for this stall
async function loadDashboard(page) {
  try {
    const response = await fetch(`/vendor/satisfaction?stallId=${stallId}&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      ratingSummaryEl.textContent = "Authentication failed! Please login.";
      return;
    }

    const data = await response.json();

    currentPage = data.page;
    lastRecentFeedbackCount = data.recentFeedback.length;

    renderRatingSummary(data.averageRating, data.totalReviews);
    renderRatingBreakdown(data.ratingBreakdown);
    renderRatingTrend(data.ratingTrend);
    renderRecentFeedback(data.recentFeedback);
    renderComplaintSummary(data.complaintSummary);

    pageLabel.textContent = `Page ${currentPage}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = lastRecentFeedbackCount < 5; // pageSize is 5 on the backend
  } catch (error) {
    console.error(error);
    ratingSummaryEl.textContent = "Failed to load";
  }
}

// Average rating number + red flag if below 3.0
function renderRatingSummary(averageRating, totalReviews) {
  if (!averageRating) {
    ratingSummaryEl.textContent = "No ratings yet";
    ratingSummaryEl.style.color = "#666";
    ratingSummarySubtextEl.textContent = "";
    return;
  }

  const rounded = averageRating.toFixed(1);
  const lowRating = averageRating < 3.0;

  ratingSummaryEl.textContent = `${rounded} / 5.0`;
  ratingSummaryEl.style.color = lowRating ? "#d9534f" : "#26a354";
  ratingSummarySubtextEl.textContent = lowRating
    ? `${totalReviews} review${totalReviews === 1 ? "" : "s"} total (needs attention)`
    : `${totalReviews} review${totalReviews === 1 ? "" : "s"} total`;
}

// 5-star down to 1-star bars, drawn as a Chart.js bar chart
function renderRatingBreakdown(ratingBreakdown) {
  const totalReviews = ratingBreakdown.reduce((sum, r) => sum + r.count, 0);

  const counts = [5, 4, 3, 2, 1].map((star) => {
    const found = ratingBreakdown.find((r) => r.Rating === star);
    return found ? found.count : 0;
  });

  if (ratingBreakdownChart) {
    ratingBreakdownChart.destroy();
  }

  ratingBreakdownChart = new Chart(ratingBreakdownCanvas, {
    type: "bar",
    data: {
      labels: ["5 star", "4 star", "3 star", "2 star", "1 star"],
      datasets: [{
        label: "Number of Reviews",
        data: counts,
        backgroundColor: CHART_GREEN,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: totalReviews > 0 },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
}

// Average rating per day over the last 30 days, drawn as a Chart.js line chart
function renderRatingTrend(ratingTrend) {
  const labels = ratingTrend.map((entry) => new Date(entry.feedbackDate).toLocaleDateString());
  const data = ratingTrend.map((entry) => entry.avgRating);

  if (ratingTrendChart) {
    ratingTrendChart.destroy();
  }

  ratingTrendChart = new Chart(ratingTrendCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Average Rating",
        data,
        borderColor: CHART_GREEN,
        backgroundColor: CHART_GREEN,
        tension: 0.3,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: ratingTrend.length > 0 },
      },
      scales: {
        y: { beginAtZero: true, suggestedMax: 5 },
      },
    },
  });
}

// Paginated recent feedback comments
function renderRecentFeedback(recentFeedback) {
  if (recentFeedback.length === 0) {
    recentFeedbackDiv.innerHTML = "<p>No feedback on this page.</p>";
    return;
  }

  recentFeedbackDiv.innerHTML = "";

  recentFeedback.forEach((item) => {
    const feedbackDate = new Date(item.CreatedDate).toLocaleDateString();

    const row = document.createElement("div");
    row.style.background = "white";
    row.style.borderRadius = "10px";
    row.style.padding = "16px";
    row.style.marginBottom = "10px";
    row.style.boxShadow = "0 3px 12px rgba(0,0,0,.08)";
    row.innerHTML = `
      <strong>Rating: ${item.Rating}/5</strong>
      <p style="margin:6px 0; color:#333;">${item.Comment || "(no comment)"}</p>
      <span style="font-size:0.85em; color:#666;">${item.customerName} - ${feedbackDate}</span>
    `;
    recentFeedbackDiv.appendChild(row);
  });
}

// Open complaint counts by category
function renderComplaintSummary(complaintSummary) {
  if (complaintSummary.length === 0) {
    complaintSummaryDiv.innerHTML = "<p>No open complaints.</p>";
    return;
  }

  complaintSummaryDiv.innerHTML = complaintSummary
    .map((c) => `<span style="display:inline-block; background:#fdecea; color:#c62828; border-radius:20px; padding:4px 12px; margin:2px; font-size:0.85em;">${c.Category}: ${c.count}</span>`)
    .join(" ");
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) loadDashboard(currentPage - 1);
});

nextPageBtn.addEventListener("click", () => {
  if (lastRecentFeedbackCount >= 5) loadDashboard(currentPage + 1);
});

window.addEventListener("load", async () => {
  const hasStall = await loadVendorStall();
  if (!hasStall) return;

  await loadDashboard(1);
});