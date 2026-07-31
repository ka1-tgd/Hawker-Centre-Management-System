const apiBaseUrl = "http://localhost:3000";

// Get headers with JWT token from localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

// Get the logged-in officer's user id from the JWT token
function getLoggedInUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

// ============ Custom popup (replaces browser alert) ============
function showPopup(message, isSuccess = true) {
  const overlay = document.getElementById("popupOverlay");
  const icon = document.getElementById("popupIcon");
  const messageEl = document.getElementById("popupMessage");

  if (!overlay) {
    alert(message);
    return;
  }

  icon.textContent = isSuccess ? "✅" : "❌";
  messageEl.textContent = message;
  overlay.classList.add("show");
}

function closePopup() {
  const overlay = document.getElementById("popupOverlay");
  if (overlay) overlay.classList.remove("show");
}

// ============ New Inspection page ============
const inspectionForm = document.getElementById("inspectionForm");

if (inspectionForm) {
  inspectionForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const inspectionData = {
      stall_id: parseInt(document.getElementById("stall").value),
      officer_id: getLoggedInUserId(),
      inspection_date: document.getElementById("date").value,
      score: parseInt(document.getElementById("score").value),
      remarks: document.getElementById("remarks").value,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/nea/inspections`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(inspectionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create inspection");
      }

      showPopup(`Inspection saved successfully. Grade: ${result.grade}`, true);
      inspectionForm.reset();

    } catch (error) {
      showPopup(`Error: ${error.message}`, false);
    }
  });
}

// Display the logged-in officer's name on the New Inspection page
async function showLoggedInOfficer() {
  const nameDisplay = document.getElementById("loggedInOfficerName");
  if (!nameDisplay) return;

  const userId = getLoggedInUserId();
  if (!userId) {
    nameDisplay.textContent = "Not logged in";
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/nea/officers`, {
      headers: getAuthHeaders(),
    });
    const officers = await response.json();
    const currentOfficer = officers.find((o) => o.user_id === userId);
    nameDisplay.textContent = currentOfficer ? currentOfficer.name : `Officer #${userId}`;
  } catch (error) {
    nameDisplay.textContent = `Officer #${userId}`;
  }
}

showLoggedInOfficer();

// ============ Stall History page ============
const loadHistoryBtn = document.getElementById("loadHistoryBtn");

if (loadHistoryBtn) {
  loadHistoryBtn.addEventListener("click", async function () {
    const stallId = document.getElementById("stallIdInput").value;
    const tableBody = document.getElementById("historyTableBody");
    const currentGrade = document.getElementById("currentGrade");

    if (!stallId) {
      showPopup("Please select a stall", false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/nea/inspections/stall/${stallId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch inspection history");
      }

      const inspections = await response.json();

      tableBody.innerHTML = "";

      if (inspections.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='6'>No records found for this stall.</td></tr>";
        currentGrade.textContent = "No grade on record.";
        return;
      }

      currentGrade.textContent = `Grade ${inspections[0].grade} (as of ${new Date(inspections[0].inspection_date).toLocaleDateString()})`;

      inspections.forEach((record) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(record.inspection_date).toLocaleDateString()}</td>
          <td>${record.score}</td>
          <td><span class="grade grade-${record.grade.toLowerCase()}">${record.grade}</span></td>
          <td>${record.remarks || ""}</td>
          <td>${record.officer_name || record.user_id}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-secondary edit-btn" data-id="${record.inspection_id}" data-score="${record.score}" data-remarks="${record.remarks || ""}">Edit</button>
              <button class="btn btn-secondary delete-btn" data-id="${record.inspection_id}">Delete</button>
            </div>
          </td>
        `;
        tableBody.appendChild(row);
      });

      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          document.getElementById("editInspectionId").value = this.dataset.id;
          document.getElementById("editScore").value = this.dataset.score;
          document.getElementById("editRemarks").value = this.dataset.remarks;
          document.getElementById("editSection").style.display = "block";
        });
      });

      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async function () {
          const confirmDelete = confirm("Are you sure you want to delete this inspection record?");
          if (!confirmDelete) return;

          const inspectionId = this.dataset.id;

          try {
            const deleteResponse = await fetch(`${apiBaseUrl}/nea/inspections/${inspectionId}`, {
              method: "DELETE",
              headers: getAuthHeaders(),
            });

            if (!deleteResponse.ok) {
              throw new Error("Failed to delete inspection");
            }

            showPopup("Inspection deleted successfully", true);
            loadHistoryBtn.click();

          } catch (error) {
            showPopup(`Error: ${error.message}`, false);
          }
        });
      });

    } catch (error) {
      console.error("Error fetching history:", error);
      tableBody.innerHTML = `<tr><td colspan='6' style="color:red;">Error: ${error.message}</td></tr>`;
    }
  });
}

// ============ Edit form handlers ============
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

if (saveEditBtn) {
  saveEditBtn.addEventListener("click", async function () {
    const inspectionId = document.getElementById("editInspectionId").value;
    const updateData = {
      score: parseInt(document.getElementById("editScore").value),
      remarks: document.getElementById("editRemarks").value,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/nea/inspections/${inspectionId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update inspection");
      }

      showPopup(`Inspection updated. New grade: ${result.grade || "unchanged"}`, true);
      document.getElementById("editSection").style.display = "none";
      document.getElementById("loadHistoryBtn").click();

    } catch (error) {
      console.error("Error updating inspection:", error);
      showPopup(`Error: ${error.message}`, false);
    }
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", function () {
    document.getElementById("editSection").style.display = "none";
  });
}

// ============ Dashboard page ============
const gradeDistributionBody = document.getElementById("gradeDistributionBody");

if (gradeDistributionBody) {
  loadDashboard();
}

async function loadDashboard() {
  await loadGradeDistribution();
  await loadExpiringSoon();
  await loadRecentInspections();
}

async function loadGradeDistribution() {
  try {
    const response = await fetch(`${apiBaseUrl}/nea/inspections/summary/grades`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch grade distribution");
    }

    const distribution = await response.json();

    document.getElementById("countA").textContent = "0";
    document.getElementById("countB").textContent = "0";
    document.getElementById("countC").textContent = "0";
    document.getElementById("countD").textContent = "0";

    distribution.forEach((row) => {
      const cell = document.getElementById(`count${row.grade}`);
      if (cell) {
        cell.textContent = row.count;
      }
    });

  } catch (error) {
    console.error("Error loading grade distribution:", error);
  }
}

async function loadExpiringSoon() {
  const tableBody = document.getElementById("expiringSoonBody");
  const emptyState = document.getElementById("expiringEmptyState");

  try {
    const response = await fetch(`${apiBaseUrl}/nea/inspections/summary/expiring`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch expiring grades");
    }

    const expiring = await response.json();

    tableBody.innerHTML = "";

    if (expiring.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    expiring.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.stall_name}</td>
        <td><span class="grade grade-${row.grade.toLowerCase()}">${row.grade}</span></td>
        <td>${new Date(row.expiry).toLocaleDateString()}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error loading expiring grades:", error);
  }
}

async function loadRecentInspections() {
  const tableBody = document.getElementById("recentInspectionsBody");
  const emptyState = document.getElementById("recentEmptyState");

  try {
    const response = await fetch(`${apiBaseUrl}/nea/inspections/summary/recent`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recent inspections");
    }

    const recent = await response.json();

    tableBody.innerHTML = "";

    if (recent.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    recent.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.stall_name}</td>
        <td>${new Date(row.inspection_date).toLocaleDateString()}</td>
        <td>${row.score}</td>
        <td><span class="grade grade-${row.grade.toLowerCase()}">${row.grade}</span></td>
        <td>${row.officer_name || row.user_id}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error loading recent inspections:", error);
  }
}

// ============ Load stall dropdown options (shared across pages) ============
async function loadStallOptions() {
  const stallDropdown = document.getElementById("stall");
  const stallHistoryDropdown = document.getElementById("stallIdInput");

  if (!stallDropdown && !stallHistoryDropdown) return;

  try {
    const response = await fetch(`${apiBaseUrl}/nea/stalls`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to load stalls");
    }

    const stalls = await response.json();
    const optionsHtml = stalls
      .map((s) => `<option value="${s.stall_id}">${s.stall_name}</option>`)
      .join("");

    if (stallDropdown) {
      stallDropdown.innerHTML = `<option value="">Select a stall</option>${optionsHtml}`;
    }
    if (stallHistoryDropdown) {
      stallHistoryDropdown.innerHTML = `<option value="">Select a stall</option>${optionsHtml}`;
    }

  } catch (error) {
    console.error("Error loading stalls:", error);
    if (stallDropdown) stallDropdown.innerHTML = '<option value="">Failed to load stalls</option>';
    if (stallHistoryDropdown) stallHistoryDropdown.innerHTML = '<option value="">Failed to load stalls</option>';
  }
}

loadStallOptions();