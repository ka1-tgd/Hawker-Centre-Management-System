// The login token saved by login.js after a successful login - must be a hawker
const token = localStorage.getItem("token");

const ratingSummaryEl = document.getElementById("ratingSummary");
const ratingSummarySubtextEl = document.getElementById("ratingSummarySubtext");
const ratingBreakdownDiv = document.getElementById("ratingBreakdown");
const ratingTrendDiv = document.getElementById("ratingTrend");
const recentFeedbackDiv = document.getElementById("recentFeedback");
const complaintSummaryDiv = document.getElementById("complaintSummary");
const complaintsListDiv = document.getElementById("complaintsList");
const pageLabel = document.getElementById("pageLabel");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const messageDiv = document.getElementById("message");

let currentPage = 1;
let lastRecentFeedbackCount = 0;
let stallId = null;

// Find the logged-in vendor's own stall, instead of hardcoding one -
// reuses the same endpoint the Stall Management page is built on
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
    nextPageBtn.disabled = lastRecentFeedbackCount < 5; 
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

// 5-star down to 1-star bars
function renderRatingBreakdown(ratingBreakdown) {
  const totalReviews = ratingBreakdown.reduce((sum, r) => sum + r.count, 0);

  if (totalReviews === 0) {
    ratingBreakdownDiv.innerHTML = "<p>No feedback submitted yet.</p>";
    return;
  }

  ratingBreakdownDiv.innerHTML = "";

  for (let star = 5; star >= 1; star--) {
    const found = ratingBreakdown.find((r) => r.Rating === star);
    const count = found ? found.count : 0;
    const percent = (count / totalReviews) * 100;

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.marginBottom = "8px";
    row.innerHTML = `
      <span style="width:50px;">${star} star</span>
      <div style="flex:1; background:#eee; border-radius:6px; height:10px; overflow:hidden;">
        <div style="width:${percent}%; background:#26a354; height:100%;"></div>
      </div>
      <span style="width:30px; text-align:right;">${count}</span>
    `;
    ratingBreakdownDiv.appendChild(row);
  }
}

// Average rating per day over the last 30 days
function renderRatingTrend(ratingTrend) {
  if (ratingTrend.length === 0) {
    ratingTrendDiv.innerHTML = "<p>No feedback in the last 30 days.</p>";
    return;
  }

  ratingTrendDiv.innerHTML = "";

  ratingTrend.forEach((entry) => {
    const date = new Date(entry.feedbackDate).toLocaleDateString();
    const percent = (entry.avgRating / 5) * 100;

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.marginBottom = "8px";
    row.innerHTML = `
      <span style="width:100px;">${date}</span>
      <div style="flex:1; background:#eee; border-radius:6px; height:10px; overflow:hidden;">
        <div style="width:${percent}%; background:#26a354; height:100%;"></div>
      </div>
      <span style="width:30px; text-align:right;">${entry.avgRating.toFixed(1)}</span>
    `;
    ratingTrendDiv.appendChild(row);
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

// Load the actual list of open complaints (with a "Mark Resolved" button each)
async function loadComplaints() {
  try {
    const response = await fetch(`/vendor/complaints?stallId=${stallId}&status=open`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      complaintsListDiv.innerHTML = "<p>Authentication failed! Please login.</p>";
      return;
    }

    const complaints = await response.json();

    if (complaints.length === 0) {
      complaintsListDiv.innerHTML = "<p>No open complaints.</p>";
      return;
    }

    complaintsListDiv.innerHTML = "";

    complaints.forEach((complaint) => {
      const complaintDate = new Date(complaint.CreatedDate).toLocaleDateString();

      const row = document.createElement("div");
      row.style.background = "white";
      row.style.borderRadius = "10px";
      row.style.padding = "16px";
      row.style.marginBottom = "10px";
      row.style.boxShadow = "0 3px 12px rgba(0,0,0,.08)";
      row.innerHTML = `
        <strong>${complaint.Category}</strong> - ${complaint.Status}
        <p style="margin:6px 0; color:#333;">${complaint.Description}</p>
        <span style="font-size:0.85em; color:#666;">Order #${complaint.order_id} - ${complaintDate}</span>
        <br>
        <button data-complaint-id="${complaint.ComplaintID}" style="margin-top:10px; background:#26a354; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer;">Mark Resolved</button>
      `;

      row.querySelector("button").addEventListener("click", () => handleResolveComplaint(complaint.ComplaintID));
      complaintsListDiv.appendChild(row);
    });
  } catch (error) {
    console.error(error);
    complaintsListDiv.innerHTML = "<p>Failed to load complaints</p>";
  }
}

// Mark a complaint as resolved
async function handleResolveComplaint(complaintId) {
  const confirmResolve = confirm("Mark this complaint as resolved?");
  if (!confirmResolve) return;

  try {
    const response = await fetch(`/vendor/complaints/${complaintId}/resolve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      messageDiv.textContent = "Complaint marked as resolved";
      messageDiv.style.color = "green";
      loadComplaints();
      loadDashboard(currentPage);
    } else {
      messageDiv.textContent = "Failed to resolve complaint";
      messageDiv.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = "Failed to resolve complaint";
    messageDiv.style.color = "red";
  }
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
  loadComplaints();
});