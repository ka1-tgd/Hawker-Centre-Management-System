const apiBaseUrl = "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

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

async function loadComplaints() {
  const tableBody = document.getElementById("complaintsTableBody");

  try {
    const stallResponse = await fetch(`${apiBaseUrl}/vendor/stalls`, {
      headers: getAuthHeaders(),
    });

    if (!stallResponse.ok) {
      throw new Error("Failed to fetch vendor stall");
    }

    const stalls = await stallResponse.json();

    if (!stalls || stalls.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='5'>No stall found for this vendor.</td></tr>";
      return;
    }

    const stallId = stalls[0].stall_id;

    const response = await fetch(`${apiBaseUrl}/complaints/stall/${stallId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch complaints");
    }

    const complaints = await response.json();

    tableBody.innerHTML = "";

    if (complaints.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='5'>No complaints for this stall.</td></tr>";
      return;
    }

    complaints.forEach((complaint) => {
      const row = document.createElement("tr");
      const createdDate = new Date(complaint.CreatedDate).toLocaleDateString();

      const isFinalized = complaint.Status === "Resolved" || complaint.Status === "Rejected";

      const statusCell = isFinalized
        ? `<span class="status-select" data-status="${complaint.Status}" style="display:inline-block;">${complaint.Status}</span>`
        : `
          <select class="status-select" data-id="${complaint.ComplaintID}" data-status="${complaint.Status}">
            <option value="Pending" ${complaint.Status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="In Progress" ${complaint.Status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Resolved" ${complaint.Status === "Resolved" ? "selected" : ""}>Resolved</option>
            <option value="Rejected" ${complaint.Status === "Rejected" ? "selected" : ""}>Rejected</option>
          </select>
        `;

      row.innerHTML = `
        <td>${complaint.customer_name}</td>
        <td>${complaint.Category}</td>
        <td>${complaint.Description}</td>
        <td>${createdDate}</td>
        <td>${statusCell}</td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll(".status-select[data-id]").forEach((select) => {
      select.addEventListener("change", async function () {
        const complaintId = this.dataset.id;
        const newStatus = this.value;

        try {
          const updateResponse = await fetch(`${apiBaseUrl}/complaints/${complaintId}/status`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus }),
          });

          const result = await updateResponse.json();

          if (!updateResponse.ok) {
            throw new Error(result.error || "Failed to update status");
          }

          this.dataset.status = newStatus;
          showPopup(`Complaint status updated to ${newStatus}`, true);
          loadComplaints();

        } catch (error) {
          console.error(error);
          showPopup(`Error: ${error.message}`, false);
        }
      });
    });

  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `<tr><td colspan='5'>Error: ${error.message}</td></tr>`;
  }
}

loadComplaints();