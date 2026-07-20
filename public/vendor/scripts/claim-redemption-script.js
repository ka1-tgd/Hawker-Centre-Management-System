// The login token saved by login.js after a successful login
// - must be a hawker account, since that's who's allowed to claim a voucher
const token = localStorage.getItem("token");

const redemptionIdInput = document.getElementById("redemptionId");
const messageEl = document.getElementById("message");

document.getElementById("saveButton").addEventListener("click", async () => {
  const redemptionId = parseInt(redemptionIdInput.value);

  if (!redemptionId) {
    messageEl.textContent = "Please enter a claim code";
    messageEl.style.color = "red";
    return;
  }

  try {
    const response = await fetch(`/redemptions/${redemptionId}/claim`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      messageEl.textContent = "Authentication failed! Please login as a hawker.";
      messageEl.style.color = "red";
      return;
    }

    const data = await response.json();

    if (response.ok) {
      messageEl.textContent = data.message;
      messageEl.style.color = "#26a354";
      redemptionIdInput.value = "";
    } else {
      messageEl.textContent = data.error;
      messageEl.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    messageEl.textContent = "Failed to process claim";
    messageEl.style.color = "red";
  }
});