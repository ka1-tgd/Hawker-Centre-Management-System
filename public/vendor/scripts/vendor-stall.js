const API_URL = "/vendor/stalls";

// =========================
// HTML Elements
// =========================

const stallTableBody = document.getElementById("stallTableBody");

const stallModal = document.getElementById("stallModal");

const stallForm = document.getElementById("stallForm");

const modalTitle = document.getElementById("modalTitle");

const btnAddStall = document.getElementById("btnAddStall");

const btnCancel = document.getElementById("cancelButton");

const btnClose = document.getElementById("closeModal");

const searchInput = document.getElementById("searchInput");

// =========================
// Load page
// =========================

document.addEventListener("DOMContentLoaded", () => {

    loadStalls();

});

// =========================
// Get All Stalls
// =========================

async function loadStalls() {

    try {

        const response = await fetch(API_URL);

        const stalls = await response.json();

        displayStalls(stalls);

    }
    catch (error) {

        console.error(error);

        alert("Unable to load stalls.");

    }

}

// =========================
// Display Table
// =========================

function displayStalls(stalls) {

    stallTableBody.innerHTML = "";

    stalls.forEach(stall => {

        stallTableBody.innerHTML += `

        <tr>

            <td>${stall.stall_id}</td>

            <td>${stall.stall_name}</td>

            <td>${stall.hawker_centre_id}</td>

            <td>${stall.description}</td>

            <td>${stall.operating_hours}</td>

            <td>${stall.contact_number}</td>

            <td>${stall.status}</td>

            <td>

                <button
                    class="editBtn"
                    onclick="editStall(${stall.stall_id})">

                    Edit

                </button>

                <button
                    class="deleteBtn"
                    onclick="deleteStall(${stall.stall_id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// =========================
// Open Add Modal
// =========================

btnAddStall.addEventListener("click", () => {

    stallForm.reset();

    document.getElementById("stall_id").value = "";

    modalTitle.textContent = "Add Stall";

    stallModal.style.display = "block";

});

// =========================
// Close Modal
// =========================

btnCancel.onclick = closeModal;

btnClose.onclick = closeModal;

window.onclick = function(event){

    if(event.target == stallModal){

        closeModal();

    }

}

function closeModal(){

    stallModal.style.display = "none";

}

// =========================
// Save Stall
// =========================

stallForm.addEventListener("submit", async function(e){

    e.preventDefault();

    const stallId = document.getElementById("stall_id").value;

    const stall = {

        hawker_centre_id: Number(document.getElementById("hawker_centre_id").value),

        stall_name: document.getElementById("stall_name").value,

        description: document.getElementById("description").value,

        operating_hours: document.getElementById("operating_hours").value,

        contact_number: document.getElementById("contact_number").value,

        status: document.getElementById("status").value

    };

    try{

        if(stallId == ""){

            await fetch(API_URL,{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(stall)

            });

        }

        else{

            await fetch(`${API_URL}/${stallId}`,{

                method:"PUT",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(stall)

            });

        }

        closeModal();

        loadStalls();

    }

    catch(error){

        console.error(error);

        alert("Unable to save stall.");

    }

});

// =========================
// Edit Stall
// =========================

async function editStall(id){

    try{

        const response = await fetch(`${API_URL}/${id}`);

        const stall = await response.json();

        modalTitle.textContent = "Edit Stall";

        document.getElementById("stall_id").value = stall.stall_id;

        document.getElementById("hawker_centre_id").value = stall.hawker_centre_id;

        document.getElementById("stall_name").value = stall.stall_name;

        document.getElementById("description").value = stall.description;

        document.getElementById("operating_hours").value = stall.operating_hours;

        document.getElementById("contact_number").value = stall.contact_number;

        document.getElementById("status").value = stall.status;

        stallModal.style.display = "block";

    }

    catch(error){

        console.error(error);

    }

}

// =========================
// Delete Stall
// =========================

async function deleteStall(id){

    if(!confirm("Delete this stall?")){

        return;

    }

    try{

        await fetch(`${API_URL}/${id}`,{

            method:"DELETE"

        });

        loadStalls();

    }

    catch(error){

        console.error(error);

    }

}

// =========================
// Search
// =========================

searchInput.addEventListener("keyup", function(){

    const keyword = this.value.toLowerCase();

    const rows = stallTableBody.querySelectorAll("tr");

    rows.forEach(row=>{

        const stallName = row.cells[1].innerText.toLowerCase();

        if(stallName.includes(keyword)){

            row.style.display="";

        }

        else{

            row.style.display="none";

        }

    });

});