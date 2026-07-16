const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Assign values
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const contactNo = document.getElementById("contact-no").value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    // Check password
    if (confirmPassword !== password) {
        alert("Password do not match!");
        return;
    }

    const newUserData = {
        name: username,
        email: email,
        password: confirmPassword,
        contact_no: contactNo,
        role: userType
    };

    try {
        // Make a POST request to your API endpoint
        const response = await fetch(`/register`, {
            method: "POST", // Specify the HTTP method
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

        if (response.status === 201) {
            alert("Account created successfully!");
            form.reset();
            window.location.href = "index.html";
        } else if (response.status === 400) {
            // Handle validation errors from the API (from Practical 04 validation middleware)
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