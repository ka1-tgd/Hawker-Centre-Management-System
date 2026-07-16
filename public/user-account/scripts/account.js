// Get role from local storage
const role = localStorage.getItem("role");

// Get header and buttons
const header = document.querySelector(".header-box");
const buttons = document.querySelectorAll(".button");

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

loadUser();

// Button listeners
document.getElementById("editButton").addEventListener("click", () => {
    window.location.href = "../html/edit_details.html";
});
document.getElementById("changePasswordButton").addEventListener("click", () => {
    window.location.href = "../html/edit_password.html";
});
document.getElementById("logOutButton").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});
document.getElementById("deleteButton").addEventListener("click", () => {
    const confirmDelete = confirm(
        "Are you sure you want to delete you account?"
    );

    if (confirmDelete) {
        alert("Delete function to be implemented");
    }
});