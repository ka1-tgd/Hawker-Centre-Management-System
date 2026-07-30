const API_BASE = "http://localhost:3000";

const token = localStorage.getItem("token");

const rentalTableBody = document.getElementById("rentalTableBody");

const modal = document.getElementById("rentalModal");

const closeBtn = document.querySelector(".close");
const closeModalBtn = document.getElementById("closeBtn");
const payBtn = document.getElementById("payBtn");

let selectedStallId = null;

// Load Rental Agreements
async function loadRentalAgreements() {

    try {

        const response = await fetch(`${API_BASE}/vendor/rentals`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const rentals = await response.json();

        rentalTableBody.innerHTML = "";

        rentals.forEach(rental => {

            rentalTableBody.innerHTML += `
                <tr>

                    <td>${rental.stall_name}</td>

                    <td>$${Number(rental.monthly_rent).toFixed(2)}</td>

                    <td class="${rental.payment_status === "Paid" ? "paid" : "unpaid"}">
                        ${rental.payment_status}
                    </td>

                    <td class="${rental.agreement_status === "Active" ? "active-status" : "pending-status"}">
                        ${rental.agreement_status}
                    </td>

                    <td>

                        <button
                            class="view-btn"
                            onclick="viewRental(${rental.stall_id})">

                            View

                        </button>

                    </td>

                </tr>
            `;

        });

    }

    catch (error) {

        console.error(error);

        alert("Failed to load rental agreements.");

    }

}

// View Rental Agreement
async function viewRental(stallId) {

    try {

        selectedStallId = stallId;

        const response = await fetch(
            `${API_BASE}/vendor/stalls/${stallId}/rental`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const rental = await response.json();

        document.getElementById("modalStall").textContent =
            rental.stall_name;

        document.getElementById("modalRent").textContent =
            Number(rental.monthly_rent).toFixed(2);

        document.getElementById("modalStart").textContent =
            new Date(rental.start_date).toLocaleDateString();

        document.getElementById("modalEnd").textContent =
            new Date(rental.end_date).toLocaleDateString();

        document.getElementById("modalPayment").textContent =
            rental.payment_status;

        document.getElementById("modalAgreement").textContent =
            rental.agreement_status;

        if (rental.payment_status === "Paid") {

            payBtn.style.display = "none";

        }

        else {

            payBtn.style.display = "inline-block";

        }

        modal.style.display = "block";

    }

    catch (error) {

        console.error(error);

        alert("Failed to retrieve rental agreement.");

    }

}

// Pay Rental
payBtn.addEventListener("click", async function () {

    if (!confirm("Pay this month's rental?"))
        return;

    try {

        const response = await fetch(

            `${API_BASE}/vendor/stalls/${selectedStallId}/rental/pay`,

            {

                method: "PUT",

                headers: {
                    Authorization: `Bearer ${token}`
                }

            }

        );

        const data = await response.json();

        alert(data.message);

        modal.style.display = "none";

        loadRentalAgreements();

    }

    catch (error) {

        console.error(error);

        alert("Payment failed.");

    }

});

// Close Modal
closeBtn.onclick = function () {

    modal.style.display = "none";

};

closeModalBtn.onclick = function () {

    modal.style.display = "none";

};

window.onclick = function (event) {

    if (event.target === modal) {

        modal.style.display = "none";

    }

};

// Initial Load
loadRentalAgreements();