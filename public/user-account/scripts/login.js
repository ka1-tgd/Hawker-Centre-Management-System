// Get log in form
const form = document.getElementById("loginForm");

// Add event listener for form submission
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get username and password from form
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Store username and password into JSON
    const loginData = {
        name: username,
        password: password
    };

    try {
        // Make POST log in request to API
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        // Parse API response as JSON if content type confirms it is a JSON
        const responseBody = response.headers
            .get("content-type")
            ?.includes("application/json")
            ? await response.json()
            : { message: response.statusText };

        // Chekc if response is ok
        if (response.status === 200) {
            // Save the JWT token, ID, username and role into local storage
            localStorage.setItem("token", responseBody.token);
            localStorage.setItem("userId", responseBody.id);
            localStorage.setItem("username", responseBody.name);
            localStorage.setItem("role", responseBody.role);
            alert("Login successful!");

            // Redirect to home page based on user's role
            if (responseBody.role === "customer") {
                window.location.href = "../../customer/html/HCs-and-stalls.html";
            } else if (responseBody.role === "hawker") {
                window.location.href = "../../vendor/html/vendor-home.html";
            } else if (responseBody.role === "officer") {
                window.location.href = "../../nea-officer/html/dashboard.html";
            } else {
                alert("Unknown role");
            }
        } else {
            alert(responseBody.message);
        }
    } catch (error) {
        // If error, log error in console and alert user
        console.error(error);
        alert("Unable to connect to the server.");
    }
});