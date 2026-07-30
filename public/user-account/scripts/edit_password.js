// Function to update password
async function updatePassword() {
    try {
        // Check if password and confirm password match
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            // If no match, alert and stop function
            alert("Password mismatch!");
            console.error("Password and confirm password do not match");
            return;
        }
        
        // Store input data into a JSON
        const passwordData = {
            password: confirmPassword,
        };

        // Call API function to update password
        const response = await fetch(`/users/${localStorage.getItem("userId")}/update-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(passwordData)
        });

        // Check response
        if (!response.ok) {
            // Throw error
            throw new Error("Failed to update password");
        };

        // Alert success
        alert("Password updated successfully");

        // Redirect to account page
        window.location.href = "../html/account.html";
    } catch (error) {
        // Log error in console and alert user
        console.error("Error updating password:", error);
        alert("Unable to update user password");
    }
};

// Get form
const editPassForm = document.getElementById("edit-password-form");

// When form is submitted, call updatePassword
editPassForm.addEventListener("submit", (e) => {
    e.preventDefault();
    updatePassword();
});