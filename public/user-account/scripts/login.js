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

            // Save the JWT token
            localStorage.setItem("token", responseBody.token);

            alert("Login successful!");

            // Redirect to account page
            window.location.href = "account.html";

        } else {

            alert(responseBody.message);

        }

    } catch (error) {

        console.error(error);
        alert("Unable to connect to the server.");

    }

});