// Get username
const username = localStorage.getItem("username");

// Function to load user details into input boxes
async function loadDetails() {
    try {
        // Get user details using username
        const response = await fetch(`/users/${username}`);

        // Check response
        if (!response.ok) {
            // If not ok, throw error
            throw new Error("Failed to retrieve user.");
        }

        const user = await response.json();

        // Set current details to input boxes
        document.getElementById("username").value = user.name;
        document.getElementById("email").value = user.email;
        document.getElementById("contact-no").value = user.contact_no;
    } catch (error) {
        // Log error in console and alert user
        console.error("Error loading details:", error);
        alert("Unable to load user details");
    };
};

// Function to update user details
async function updateDetails() {
    try {
        // Get input
        const newName = document.getElementById("username").value;
        const newEmail = document.getElementById("email").value;
        const newContact = document.getElementById("contact-no").value;

        // Store input data into a JSON
        const newDetails = {
            name: newName,
            email: newEmail,
            contact_no: newContact
        };

        // Call API function to update user
        const response = await fetch(`/users/${localStorage.getItem("userId")}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newDetails)
        });

        // Check response
        if (!response.ok) {
            // Throw error
            throw new Error("Failed to update user");
        };
        
        // Get updatedUser
        const updatedUser = await response.json();

        // Update username in local storage
        localStorage.setItem("username", updatedUser.name);

        // Alert success
        alert("Details updated successfully");

        // Redirect to account page
        window.location.href = "../html/account.html";
    } catch (error) {
        // Log error in console and alert user
        console.error("Error updating details:", error);
        alert("Unable to update user details");
    }
};

// Display current details when page loads
window.addEventListener("load", loadDetails);

// Get form
const editForm = document.getElementById("edit-form");

// When form is submitted, call updateDetails
editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    updateDetails();
});