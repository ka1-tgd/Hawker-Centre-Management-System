const token = localStorage.getItem("token");

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

// Derive userId from the JWT token payload instead of relying on a separate localStorage value
function getUserIdFromToken() {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

const userId = getUserIdFromToken();

const orderSelect = document.getElementById("orderSelect");
const categorySelect = document.getElementById("categorySelect");
const descriptionInput = document.getElementById("descriptionInput");
const complaintForm = document.getElementById("complaintForm");
const complaintListDiv = document.getElementById("complaintList");

// ============ Load orders eligible for a complaint ============
async function loadEligibleOrders() {
  if (!userId) {
    orderSelect.innerHTML = '<option value="">Please login first.</option>';
    return;
  }

  try {
    const response = await fetch(`/complaints/orders/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      orderSelect.innerHTML = '<option value="">Authentication failed! Please login.</option>';
      return;
    }

    const orders = await response.json();

    if (orders.length === 0) {
      orderSelect.innerHTML = '<option value="">No past orders found</option>';
      return;
    }

    orderSelect.innerHTML = "";
    orders.forEach((order) => {
      const option = document.createElement("option");
      option.value = `${order.order_id}-${order.stall_id}`;
      const orderDate = new Date(order.order_date).toLocaleDateString();
      option.textContent = `Order #${order.order_id} - ${order.stall_name} (${orderDate})`;
      orderSelect.appendChild(option);
    });

  } catch (error) {
    console.error(error);
    orderSelect.innerHTML = '<option value="">Failed to load orders</option>';
  }
}

// ============ Load the customer's previously submitted complaints ============
async function loadMyComplaints() {
  if (!userId) {
    complaintListDiv.innerHTML = "<p>Please login first.</p>";
    return;
  }

  try {
    complaintListDiv.innerHTML = "Loading your complaints...";

    const response = await fetch(`/complaints/customer/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      complaintListDiv.innerHTML = "Authentication failed! Please login.";
      return;
    }

    const complaints = await response.json();

    if (complaints.length === 0) {
      complaintListDiv.innerHTML = "<p>You have not submitted any complaints yet.</p>";
      return;
    }

    complaintListDiv.innerHTML = "";

    const statusClassMap = {
      "Pending": "status-pending",
      "In Progress": "status-in-progress",
      "Resolved": "status-resolved",
      "Rejected": "status-rejected",
    };

    complaints.forEach((complaint) => {
      const item = document.createElement("div");
      const createdDate = new Date(complaint.CreatedDate).toLocaleDateString();
      const canDelete = complaint.Status === "Pending";
      const statusClass = statusClassMap[complaint.Status] || "status-pending";

      item.className = "complaint-card";
      item.innerHTML = `
        <div class="complaint-card-header">
          <strong>${complaint.stall_name}</strong>
          <span class="status-badge ${statusClass}">${complaint.Status}</span>
        </div>
        <span class="complaint-tag">${complaint.Category}</span>
        <p class="feedback-comment">${complaint.Description}</p>
        <p class="feedback-date">Submitted: ${createdDate}</p>
        ${canDelete ? `<button class="delete-complaint-btn" data-id="${complaint.ComplaintID}">Delete</button>` : ""}
      `;

      complaintListDiv.appendChild(item);
    });

    document.querySelectorAll(".delete-complaint-btn").forEach((btn) => {
      btn.addEventListener("click", async function () {
        const confirmDelete = confirm("Are you sure you want to delete this complaint?");
        if (!confirmDelete) return;

        const complaintId = this.dataset.id;

        try {
          const deleteResponse = await fetch(`/complaints/${complaintId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          const result = await deleteResponse.json();

          if (!deleteResponse.ok) {
            throw new Error(result.error || "Failed to delete complaint");
          }

          showPopup("Complaint deleted successfully.", true);
          loadMyComplaints();

        } catch (error) {
          console.error(error);
          showPopup(`Error: ${error.message}`, false);
        }
      });
    });

  } catch (error) {
    console.error(error);
    complaintListDiv.innerHTML = "<p>Failed to load complaints.</p>";
  }
}

// ============ Handle complaint form submission ============
complaintForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!userId) {
    showPopup("Please login first.", false);
    return;
  }

  const selectedValue = orderSelect.value;
  if (!selectedValue) {
    showPopup("Please select an order.", false);
    return;
  }

  const [orderId, stallId] = selectedValue.split("-").map(Number);

  const complaintData = {
    order_id: orderId,
    user_id: userId,
    stall_id: stallId,
    category: categorySelect.value,
    description: descriptionInput.value,
  };

  try {
    const response = await fetch("/complaints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(complaintData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to submit complaint");
    }

    showPopup("Complaint submitted successfully.", true);
    complaintForm.reset();
    loadMyComplaints();

  } catch (error) {
    console.error(error);
    showPopup(`Error: ${error.message}`, false);
  }
});

loadEligibleOrders();
loadMyComplaints();