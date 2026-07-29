const STALL_API_URL = "/vendor/stalls";
const ORDER_API_URL = "/vendor/stalls/orders";

const token = localStorage.getItem("token");

const stallSelect = document.getElementById("stallSelect");
const orderTableBody = document.getElementById("orderTableBody");
const orderModal = document.getElementById("orderModal");
const orderForm = document.getElementById("orderForm");
const btnClose = document.getElementById("closeModal");
const btnCancel = document.getElementById("cancelButton");
const modalTitle = document.getElementById("modalTitle");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }
    loadVendorStalls();
});

//Load Stalls into Dropdown so vendor can select which stall orders to view
async function loadVendorStalls() {
    try {
        const response = await fetch(STALL_API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const stalls = await response.json();
        
        stallSelect.innerHTML = '<option value="">-- Choose a Stall --</option>';
        stalls.forEach(stall => {
            stallSelect.innerHTML += `<option value="${stall.stall_id}">${stall.stall_name} (ID: ${stall.stall_id})</option>`;
        });
        //If there is previously selected stall in localStorage, select it automatically
        const savedStallId = localStorage.getItem("selectedStallId");
        if (savedStallId) {
            stallSelect.value = savedStallId;
            loadOrders(savedStallId);
        }
    } catch (err) {
        console.error("Error loading stalls:", err);
    }
}

stallSelect.addEventListener("change", function () {
    const stallId = this.value;
    if (stallId) {
        localStorage.setItem("selectedStallId", stallId);
        loadOrders(stallId);
    } else {
        orderTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">Please select a stall to view orders.</td></tr>`;
    }
});

//Fetch Orders for the selected stall using your backend route
async function loadOrders(stallId) {
    try {
        const response = await fetch(`${ORDER_API_URL}/${stallId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 404 || response.headers.get("content-length") === "0") {
            orderTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No orders found for this stall.</td></tr>`;
            return;
        }
        const orders = await response.json();
        displayOrders(orders);
    } catch (err) {
        console.error("Error loading orders:", err);
        orderTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No orders found or error loading data.</td></tr>`;
    }
}

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'pending': return '#ffbf00';
        case 'preparing': return '#ff7f50';
        case 'completed': return '#27ae60';
        case 'cancelled': return '#c0392b';
        default: return '#333333';
    }
}

//Render Orders and nested items into the table
function displayOrders(orders) {
    orderTableBody.innerHTML = "";

    if (!Array.isArray(orders) || orders.length === 0) {
        orderTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No orders found for this stall.</td></tr>`;
        return;
    }
    orders.forEach(order => {
        //Format items list for display
        const itemsList = order.items.map(item => 
            `<li>Item ID: ${item.menu_item_id} (x${item.quantity}) - $${Number(item.unit_price).toFixed(2)}</li>`
        ).join("");

        const statusColor = getStatusColor(order.status);
        orderTableBody.innerHTML += `
        <tr>
            <td>#${order.order_id}</td>
            <td>${order.customer.name} (ID: ${order.customer.user_id})</td>
            <td>${new Date(order.order_date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}</td>
            <td><ul style="margin: 0; padding-left: 15px; text-align: left;">${itemsList}</ul></td>
            <td>$${Number(order.total_amount).toFixed(2)}</td>
            <td>${order.payment_type}</td>
            <td><strong style="color: ${statusColor};">${order.status}</strong></td>
            <td>
                <button class="editBtn" onclick="openStatusModal(${order.order_id}, '${order.status}')">
                    Update Status
                </button>
            </td>
        </tr>
        `;
    });
}

//Modal Controls
function openStatusModal(orderId, currentStatus) {
    document.getElementById("modal_order_id").value = orderId;
    document.getElementById("current_status").value = currentStatus;
    modalTitle.textContent = `Update Order #${orderId} Status`;
    orderModal.style.display = "block";
}
btnClose.addEventListener("click", closeModal);
btnCancel.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
    if (e.target === orderModal) closeModal();
});
function closeModal() {
    orderModal.style.display = "none";
}

//Submit status update using your PUT route
orderForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const orderId = document.getElementById("modal_order_id").value;
    const newStatus = document.getElementById("new_status").value;

    try {
        const response = await fetch(`/vendor/stalls/orders/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to update status");
        }
        alert("Order status updated successfully!");
        closeModal();
        //Reload table for current stall
        const activeStallId = stallSelect.value;
        if (activeStallId) loadOrders(activeStallId);
    } catch (err) {
        console.error("Error updating status:", err);
        alert(err.message || "Unable to update order status.");
    }
});