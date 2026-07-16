// it is to check whether user is login at the start

// const token = localStorage.getItem("token");

// if (!token) {

//     alert("Please login first.");

//     window.location.href = "login.html";

// }

// elements

const vendorName = document.getElementById("vendorName");
const logoutBtn = document.getElementById("logoutBtn");

// username
const username = localStorage.getItem("username");
if (username) {
    vendorName.textContent = `Welcome, ${username}`;
}
else {
    vendorName.textContent = "Welcome, Vendor";
}

// navigation

const dashboardCards = document.querySelectorAll(".dashboard-card");
dashboardCards.forEach(card => {
    card.addEventListener("click", function (event) {
        const page = this.getAttribute("href");
        if (page) {
            window.location.href = page;
        }
    });
});

//logout

logoutBtn.addEventListener("click", function () {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (!confirmLogout) {
        return;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "login.html";

});