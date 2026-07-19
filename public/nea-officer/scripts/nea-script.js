const apiBaseUrl = "http://localhost:3000";

// Get headers with JWT token from localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

// ============ New Inspection page ============
const inspectionForm = document.getElementById("inspectionForm");

if (inspectionForm) {
  inspectionForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const messageDiv = document.getElementById("message");
    messageDiv.textContent = "Submitting...";

    const inspectionData = {
      stall_id: parseInt(document.getElementById("stall").value),
      officer_id: parseInt(document.getElementById("officer").value),
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

      messageDiv.style.color = "green";
      messageDiv.textContent = `Inspection saved. Grade: ${result.grade}`;
      inspectionForm.reset();

    } catch (error) {
      console.error("Error creating inspection:", error);
      messageDiv.style.color = "red";
      messageDiv.textContent = `Error: ${error.message}`;
    }
  });
}

// ============ Stall History page ============
const loadHistoryBtn = document.getElementById("loadHistoryBtn");

if (loadHistoryBtn) {
  loadHistoryBtn.addEventListener("click", async function () {
    const stallId = document.getElementById("stallIdInput").value;
    const tableBody = document.getElementById("historyTableBody");
    const currentGrade = document.getElementById("currentGrade");

    if (!stallId) {
      alert("Please enter a stall ID");
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
          <td>${record.user_id}</td>
          <td>
            <button class="btn btn-secondary edit-btn" data-id="${record.inspection_id}" data-score="${record.score}" data-remarks="${record.remarks || ""}">Edit</button>
            <button class="btn btn-secondary delete-btn" data-id="${record.inspection_id}">Delete</button>
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

            alert("Inspection deleted successfully");
            loadHistoryBtn.click();

          } catch (error) {
            console.error("Error deleting inspection:", error);
            alert(`Error: ${error.message}`);
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

      alert(`Inspection updated. New grade: ${result.grade || "unchanged"}`);
      document.getElementById("editSection").style.display = "none";
      document.getElementById("loadHistoryBtn").click();

    } catch (error) {
      console.error("Error updating inspection:", error);
      alert(`Error: ${error.message}`);
    }
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", function () {
    document.getElementById("editSection").style.display = "none";
  });
}
