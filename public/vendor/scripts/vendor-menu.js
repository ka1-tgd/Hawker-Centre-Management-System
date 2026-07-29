const API_URL = "/vendor/stalls";

const stallList = document.getElementById("stallList");
const menuGrid = document.getElementById("menuGrid");
const currentStallName = document.getElementById("currentStallName");
const searchInput = document.getElementById("searchInput");

const menuModal = document.getElementById("menuModal");
const menuForm = document.getElementById("menuForm");

const btnAddMenuItem = document.getElementById("btnAddMenuItem");
const btnClose = document.getElementById("closeModal");
const btnCancel = document.getElementById("cancelButton");

const modalTitle = document.getElementById("modalTitle");

// ==============================
// Variables
// ==============================

const token = localStorage.getItem("token");

let selectedStallId = null;

let menuItems = [];

// ==============================
// Page Load
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    if (!token) {

        alert("Please login first.");

        return;

    }

    loadStalls();

});

// ==============================
// Load Stalls
// ==============================

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

    catch (error) {

        console.error(error);

        alert("Unable to load stalls.");

    }

}

// ==============================
// Display Stalls
// ==============================

function displayStalls(stalls) {

    stallList.innerHTML = "";

    stalls.forEach(function (stall) {

        const card = document.createElement("div");

        card.className = "stall-card";

        card.textContent = stall.stall_name;

        card.onclick = function () {

            document.querySelectorAll(".stall-card").forEach(function (item) {

                item.classList.remove("active");

            });

            card.classList.add("active");

            selectedStallId = stall.stall_id;

            currentStallName.textContent = stall.stall_name;

            loadMenuItems();

        };

        stallList.appendChild(card);

    });

}

// ==============================
// Load Menu Items
// ==============================

async function loadMenuItems() {

    if (selectedStallId == null) {

        return;

    }

    try {

        const response = await fetch(

            `${API_URL}/${selectedStallId}/menu`,

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        menuItems = await response.json();

        displayMenuItems(menuItems);

    }

    catch (error) {

        console.error(error);

        alert("Unable to load menu items.");

    }

}

// ==============================
// Display Menu Items
// ==============================

function displayMenuItems(menuItems) {

    menuGrid.innerHTML = "";

    menuItems.forEach(function (menuItem) {

        menuGrid.innerHTML += `

        <div class="menu-card">

            <div class="menu-image">

                🍽️

            </div>

            <div class="menu-details">

                <h3>${menuItem.item_name}</h3>

                <p class="menu-description">

                    ${menuItem.description ?? ""}

                </p>

                <div class="price">

                    $${Number(menuItem.price).toFixed(2)}

                </div>

                <div class="category">

                    ${menuItem.category}

                </div>

                <br><br>

                <span class="status ${menuItem.availability === "Y" ? "available" : "unavailable"}">

                    ${menuItem.availability === "Y" ? "Available" : "Unavailable"}

                </span>

                <br><br>

                <div class="button-row">

                    <button
                        class="editBtn"
                        onclick="editMenuItem(${menuItem.menu_item_id})">

                        Edit

                    </button>

                    <button
                        class="deleteBtn"
                        onclick="deleteMenuItem(${menuItem.menu_item_id})">

                        Delete
                    </button>
                </div>
            </div>
        </div>
        `;
    });
}

// ==============================
// Open Add Menu Item Modal
// ==============================

btnAddMenuItem.addEventListener("click", function () {
    if (selectedStallId == null) {
        alert("Please select a stall first.");
        return;
    }

    menuForm.reset();
    document.getElementById("menu_item_id").value = "";
    modalTitle.textContent = "Add Menu Item";
    menuModal.style.display = "block";
});


// ==============================
// Close Modal
// ==============================

btnClose.addEventListener("click", closeModal);
btnCancel.addEventListener("click", closeModal);
window.addEventListener("click", function (event) {

    if (event.target === menuModal) {
        closeModal();
    }

});

function closeModal() {
    menuModal.style.display = "none";
}


// ==============================
// Save Menu Item
// ==============================

menuForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const menuItemId = document.getElementById("menu_item_id").value;
    const menuItem = {
        item_name: document.getElementById("item_name").value,
        description: document.getElementById("description").value,
        price: Number(document.getElementById("price").value),
        category: document.getElementById("category").value,
        availability: document.getElementById("availability").value
    };

    try {
        if (menuItemId === "") {
            await fetch(
                `${API_URL}/${selectedStallId}/menu`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(menuItem)
                }
            );
        }
        else {
            await fetch(
                `${API_URL}/${selectedStallId}/menu/${menuItemId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`

                    },
                    body: JSON.stringify(menuItem)
                }
            );
        }
        closeModal();
        loadMenuItems();
    }

    catch (error) {
        console.error(error);
        alert("Unable to save menu item.");
    }
});

async function editMenuItem(menuItemId) {
    try {
        const response = await fetch(
            `${API_URL}/${selectedStallId}/menu/${menuItemId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const menuItem = await response.json();
        document.getElementById("menu_item_id").value = menuItem.menu_item_id;
        document.getElementById("item_name").value = menuItem.item_name;
        document.getElementById("description").value = menuItem.description;
        document.getElementById("price").value = menuItem.price;
        document.getElementById("category").value = menuItem.category;
        document.getElementById("availability").value = menuItem.availability;
        modalTitle.textContent = "Edit Menu Item";
        menuModal.style.display = "block";
    }

    catch (error) {
        console.error(error);
        alert("Unable to load menu item.");
    }

}

async function deleteMenuItem(menuItemId) {

    if (!confirm("Delete this menu item?")) {
        return;
    }

    try {
        await fetch(
            `${API_URL}/${selectedStallId}/menu/${menuItemId}`,

            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        );
        loadMenuItems();
    }

    catch (error) {
        console.error(error);
        alert("Unable to delete menu item.");
    }

}


// ==============================
// Search
// ==============================

searchInput.addEventListener("keyup", function () {
    const keyword = this.value.toLowerCase();
    const filteredMenuItems = menuItems.filter(function (menuItem) {
        return menuItem.item_name.toLowerCase().includes(keyword);

    });
    displayMenuItems(filteredMenuItems);
});