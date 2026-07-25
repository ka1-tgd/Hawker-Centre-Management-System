// The login token saved by login.js after a successful login
const token = localStorage.getItem("token");

const redemptionIdInput = document.getElementById("redemptionId");
const messageEl = document.getElementById("message");
const rewardDetailsDiv = document.getElementById("rewardDetails");
const rewardNameEl = document.getElementById("rewardName");
const rewardHonorEl = document.getElementById("rewardHonor");
const rewardDescriptionEl = document.getElementById("rewardDescription");

// Turn a reward's DiscountType/DiscountValue into a plain instruction 
function describeHonor(discountType, discountValue) {
  if (discountType === "Percentage") {
    return `Give ${discountValue}% off this order`;
  }
  if (discountType === "Fixed Amount") {
    return `Give $${Number(discountValue).toFixed(2)} off this order`;
  }
  return "Give this item to the customer for free";
}

// Look up the claim code and show what to honor, without
// claiming it yet - so the vendor can see it before confirming
document.getElementById("lookupButton").addEventListener("click", async () => {
  const redemptionId = parseInt(redemptionIdInput.value);

  rewardDetailsDiv.style.display = "none";
  messageEl.textContent = "";

  if (!redemptionId) {
    messageEl.textContent = "Please enter a claim code";
    messageEl.style.color = "red";
    return;
  }

  try {
    const response = await fetch(`/redemptions/${redemptionId}/details`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      messageEl.textContent = "Authentication failed! Please login as a hawker.";
      messageEl.style.color = "red";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      messageEl.textContent = data.error;
      messageEl.style.color = "red";
      return;
    }

    rewardNameEl.textContent = data.RewardName;
    rewardHonorEl.textContent = describeHonor(data.DiscountType, data.DiscountValue);
    rewardDescriptionEl.textContent = data.Description || "";
    rewardDetailsDiv.style.display = "block";
    rewardDetailsDiv.dataset.redemptionId = redemptionId;
  } catch (error) {
    console.error(error);
    messageEl.textContent = "Failed to look up claim code";
    messageEl.style.color = "red";
  }
});

// Confirm the claim, once the vendor has seen what it's for
document.getElementById("saveButton").addEventListener("click", async () => {
  const redemptionId = parseInt(rewardDetailsDiv.dataset.redemptionId);

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
      rewardDetailsDiv.style.display = "none";
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