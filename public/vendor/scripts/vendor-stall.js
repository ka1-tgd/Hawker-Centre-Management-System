const API_URL = "/vendor/stalls";

// html 

const stallTableBody = document.getElementById("stallTableBody");
const stallModal = document.getElementById("stallModal");
const stallForm = document.getElementById("stallForm");

const btnAddStall = document.getElementById("btnAddStall");
const btnClose = document.getElementById("closeModal");
const btnCancel = document.getElementById("cancelButton");

const modalTitle = document.getElementById("modalTitle");
const searchInput = document.getElementById("searchInput");

// JWT Token
const token = localStorage.getItem("token");

// page load

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        alert("Please login first.");
        return;
    }
    loadStalls();
});

// load the stalls

async function loadStalls() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const stalls = await response.json();
        displayStalls(stalls);
    }
    catch (err) {
        console.error(err);
        alert("Unable to load stalls.");

    }

}

// display the table

function displayStalls(stalls) {

    stallTableBody.innerHTML = "";
    stalls.forEach(stall => {
        stallTableBody.innerHTML += `
        <tr>
            <td>${stall.stall_id}</td>
            <td>${stall.stall_name}</td>
            <td>${stall.hawker_centre_id}</td>
            <td>${stall.description}</td>
            <td>${stall.operating_hours}</td>
            <td>${stall.contact_number}</td>
            <td>${stall.status}</td>
            <td>
                <button class="editBtn"
                    onclick="editStall(${stall.stall_id})">
                    Edit
                </button>
                <button class="deleteBtn"
                    onclick="deleteStall(${stall.stall_id})">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });
}

// open modal

btnAddStall.addEventListener("click", () => {
    stallForm.reset();
    document.getElementById("stall_id").value = "";
    modalTitle.textContent = "Add Stall";
    stallModal.style.display = "block";
});

// close the modal

btnClose.addEventListener("click", closeModal);
btnCancel.addEventListener("click", closeModal);
window.addEventListener("click", function (event) {

    if (event.target === stallModal) {
        closeModal();
    }
});

function closeModal() {
    stallModal.style.display = "none";
}

// save stall

stallForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const stallId = document.getElementById("stall_id").value;
    const stall = {
        hawker_centre_id: Number(document.getElementById("hawker_centre_id").value),
        stall_name: document.getElementById("stall_name").value,
        description: document.getElementById("description").value,
        operating_hours: document.getElementById("operating_hours").value,
        contact_number: document.getElementById("contact_number").value,
        status: document.getElementById("status").value
    };

    try {
        if (stallId === "") {
            await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(stall)
            });
        }
        else {
            await fetch(`${API_URL}/${stallId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(stall)
            });
        }
        closeModal();
        loadStalls();
    }
    catch (err) {
        console.error(err);
        alert("Unable to save stall.");
    }
});

// edit stall

async function editStall(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }

        });
        const stall = await response.json();
        modalTitle.textContent = "Edit Stall";
        document.getElementById("stall_id").value = stall.stall_id;
        document.getElementById("hawker_centre_id").value = stall.hawker_centre_id;
        document.getElementById("stall_name").value = stall.stall_name;
        document.getElementById("description").value = stall.description;
        document.getElementById("operating_hours").value = stall.operating_hours;
        document.getElementById("contact_number").value = stall.contact_number;
        document.getElementById("status").value = stall.status;
        stallModal.style.display = "block";
    }
    catch (err) {
        console.error(err);
    }
}

// Delete

async function deleteStall(id) {
    if (!confirm("Delete this stall?")) {
        return;
    }

    try {
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        loadStalls();

    }
    catch (err) {
        console.error(err);
    }

}
// search

searchInput.addEventListener("keyup", function () {
    const keyword = this.value.toLowerCase();
    const rows = stallTableBody.querySelectorAll("tr");
    rows.forEach(row => {
        const stallName = row.cells[1].textContent.toLowerCase();
        row.style.display = stallName.includes(keyword) ? "" : "none";
    });
});