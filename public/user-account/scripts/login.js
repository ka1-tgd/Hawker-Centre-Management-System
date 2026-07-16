const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const loginData = {
        name: username,
        password: password
    };

    try {

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const responseBody = response.headers
            .get("content-type")
            ?.includes("application/json")
            ? await response.json()
            : { message: response.statusText };

        if (response.status === 200) {
            // Save the JWT token and role
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
        console.error(error);
        alert("Unable to connect to the server.");
    }
});