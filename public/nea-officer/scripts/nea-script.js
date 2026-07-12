const apiBaseUrl = "http://localhost:3000";

// ============ New Inspection page ============
const inspectionForm = document.getElementById("inspectionForm");

if (inspectionForm) {
  inspectionForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const messageDiv = document.getElementById("message");
    messageDiv.textContent = "Submitting...";

    const inspectionData = {
      stall_id: parseInt(document.getElementById("stall").value),
      officer_id: parseInt(document.getElementById("officer").value),
      inspection_date: document.getElementById("date").value,
      score: parseInt(document.getElementById("score").value),
      remarks: document.getElementById("remarks").value,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/nea/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspectionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create inspection");
      }

      messageDiv.style.color = "green";
      messageDiv.textContent = `Inspection saved. Grade: ${result.grade}`;
      inspectionForm.reset();

    } catch (error) {
      console.error("Error creating inspection:", error);
      messageDiv.style.color = "red";
      messageDiv.textContent = `Error: ${error.message}`;
    }
  });
}

// ============ Stall History page ============
const loadHistoryBtn = document.getElementById("loadHistoryBtn");

if (loadHistoryBtn) {
  loadHistoryBtn.addEventListener("click", async function () {
    const stallId = document.getElementById("stallIdInput").value;
    const tableBody = document.getElementById("historyTableBody");
    const currentGrade = document.getElementById("currentGrade");

    if (!stallId) {
      alert("Please enter a stall ID");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/nea/inspections/stall/${stallId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch inspection history");
      }

      const inspections = await response.json();

      tableBody.innerHTML = "";

      if (inspections.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='6'>No records found for this stall.</td></tr>";
        currentGrade.textContent = "No grade on record.";
        return;
      }

      // Current grade = most recent inspection (first row, since ordered DESC)
      currentGrade.textContent = `Grade ${inspections[0].grade} (as of ${new Date(inspections[0].inspection_date).toLocaleDateString()})`;

      inspections.forEach((record) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(record.inspection_date).toLocaleDateString()}</td>
          <td>${record.score}</td>
          <td><span class="grade grade-${record.grade.toLowerCase()}">${record.grade}</span></td>
          <td>${record.remarks || ""}</td>
          <td>${record.user_id}</td>
          <td></td>
        `;
        tableBody.appendChild(row);
      });

    } catch (error) {
      console.error("Error fetching history:", error);
      tableBody.innerHTML = `<tr><td colspan='6' style="color:red;">Error: ${error.message}</td></tr>`;
    }
  });
}