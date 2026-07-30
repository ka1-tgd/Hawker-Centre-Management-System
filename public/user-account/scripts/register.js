// Get sign up form
const form = document.getElementById("signup-form");

// Add event listener for form submission
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Assign values
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const contactNo = document.getElementById("contact-no").value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    // Check if passwords match
    if (confirmPassword !== password) {
        alert("Password do not match!");
        return;
    }

    // Store user data in JSON
    const newUserData = {
        name: username,
        email: email,
        password: confirmPassword,
        contact_no: contactNo,
        role: userType
    };

    try {
        // Make a POST request to API
        const response = await fetch(`/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUserData),
        }); 

        // Check API response status
        const responseBody = response.headers
            .get("content-type")
            ?.includes("application/json")
            ? await response.json()
            : { message: response.statusText };

        // If response is ok
        if (response.status === 201) {
            alert("Account created successfully!");

            // Reset form and redirect to log in page
            form.reset();
            window.location.href = "index.html";
        } else if (response.status === 400) {
            // Handle validation errors from the API
            messageDiv.textContent = `Validation Error: ${responseBody.message}`;
            messageDiv.style.color = "red";
            console.error("Validation Error:", responseBody);
        } else {
            alert(responseBody.message);
        }
    } catch (error) {
        console.error("Error creating user:", error);
        messageDiv.textContent = `Failed to create user : ${error.message}`;
        messageDiv.style.color = "red";
    }
});