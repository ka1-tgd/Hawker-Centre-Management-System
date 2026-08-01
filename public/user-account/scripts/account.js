// Get role from local storage
const role = localStorage.getItem("role");

// Get header and buttons
const header = document.querySelector(".header-box");
const buttons = document.querySelectorAll(".button");
const backButton = document.querySelector(".back-button");

// Default colour
let themeColour = "#ea5656";

// Set theme colour based on role
if (role === "customer") {
    themeColour = "#2b3a8f";
} else if (role === "hawker") {
    themeColour = "#26a354";
} else if (role === "officer") {
    themeColour = "#4c3a6e";
}

// Apply theme colour
header.style.backgroundColor = themeColour;
buttons.forEach(button => {
    button.style.backgroundColor = themeColour;
});
backButton.style.backgroundColor = themeColour;

// Load user details
const username = localStorage.getItem("username");
async function loadUser() {
    try {
        const response = await fetch(`/users/${username}`);
        const user = await response.json();

        document.getElementById("userName").textContent = user.name;
        document.getElementById("userEmail").textContent = user.email;
        document.getElementById("userContact").textContent = user.contact_no;
        document.getElementById("userRole").textContent = user.role;
    } catch (error) {
        console.error(error);
        alert("Unable to load account details.");
    }
}

// Call load user when page loads
window.addEventListener("load", loadUser);

// Button listeners
document.getElementById("editButton").addEventListener("click", () => {
    // Redirect to edit details page
    window.location.href = "../html/edit_details.html";
});
document.getElementById("changePasswordButton").addEventListener("click", () => {
    // Redirect to edit password page
    window.location.href = "../html/edit_password.html";
});
document.getElementById("logOutButton").addEventListener("click", () => {
    // Clear localstorage and redirect to log in page
    localStorage.clear();
    window.location.href = "index.html";
});
document.getElementById("deleteButton").addEventListener("click", async () => {
    try {
        // Ask for confirmation
        const confirmDelete = confirm(
            "Are you sure you want to delete your account?"
        );

        if (confirmDelete) {
            // Send DELETE request to API
            const response = await fetch(`/users/${localStorage.getItem("userId")}`, {
                method: "DELETE",
            });

            // Check response
            if (!response.ok) {
                // If not ok, throw error
                throw new Error("Failed to delete user");
            }

            // Clear local storage, alert and redirect to log in
            localStorage.clear();
            alert("Account deleted successfully");
            window.location.href = "../html/index.html";
        };
    } catch (error) {
        // Log error in console alert
        console.error("Error deleting account:", error);
        alert("Unable to delete account");
    }
});
document.getElementById("backButton").addEventListener("click", async () => {
    // Redirect based on role
    if (role === "customer") {
        window.location.href = "../../customer/html/HCs-and-stalls.html";
    } else if (role === "hawker") {
        window.location.href = "../../vendor/html/vendor-home.html";
    } else if (role === "officer") {
        window.location.href = "../../nea-officer/html/dashboard.html";
    };
});