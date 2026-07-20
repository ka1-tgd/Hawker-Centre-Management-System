// The login token saved by login.js after a successful login
const token = localStorage.getItem("token");

const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userContactEl = document.getElementById("userContact");
const pointsValueEl = document.getElementById("pointsValue");
const tierLabelEl = document.getElementById("tierLabel");
const progressFillEl = document.getElementById("progressFill");
const rewardGridEl = document.getElementById("rewardGrid");
const redemptionListEl = document.getElementById("redemptionList");
const messageEl = document.getElementById("message");

// Points required to REACH each tier (simple fixed thresholds)
const tierThresholds = { Bronze: 0, Silver: 100, Gold: 250 };
const tierOrder = ["Bronze", "Silver", "Gold"];

let currentPoints = 0;

// Load the user's profile details (name, email, contact)
async function loadUserDetails() {
  try {
    const response = await fetch(`/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      userNameEl.textContent = "Authentication failed! Please login.";
      return;
    }

    const user = await response.json();

    userNameEl.textContent = user.name;
    userEmailEl.textContent = `Email: ${user.email}`;
    userContactEl.textContent = `Contact: ${user.contact_no}`;
  } catch (error) {
    console.error(error);
    userNameEl.textContent = "Failed to load profile";
  }
}

// Load the user's loyalty points and tier
async function loadLoyaltyPoints() {
  try {
    const response = await fetch(`/loyalty/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      tierLabelEl.textContent = "Authentication failed! Please login.";
      return;
    }

    const loyalty = await response.json();

    currentPoints = loyalty.CurrentPoints;
    pointsValueEl.textContent = currentPoints;
    tierLabelEl.textContent = `Current Tier: ${loyalty.Tier}`;

    // Find the tier after the current one - Gold has no "next" tier, so show a full bar
    const currentIndex = tierOrder.indexOf(loyalty.Tier);
    const nextTier = tierOrder[currentIndex + 1];

    if (nextTier) {
      const progressPercent = Math.min((currentPoints / tierThresholds[nextTier]) * 100, 100);
      progressFillEl.style.width = `${progressPercent}%`;
    } else {
      progressFillEl.style.width = "100%";
    }
  } catch (error) {
    console.error(error);
    tierLabelEl.textContent = "Failed to load loyalty points";
  }
}

// Load and render the rewards list
async function loadRewards() {
  try {
    const response = await fetch("/rewards", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      rewardGridEl.innerHTML = "<p>Authentication failed! Please login.</p>";
      return;
    }

    const rewards = await response.json();

    rewardGridEl.innerHTML = "";

    rewards.forEach((reward) => {
      const card = document.createElement("div");
      card.classList.add("reward-card");

      card.innerHTML = `
        <h4>${reward.RewardName}</h4>
        <p>${reward.Description || ""}</p>
        <p>${reward.PointsRequired} points</p>
        <button data-reward-id="${reward.RewardID}">Use</button>
      `;

      const useBtn = card.querySelector("button");

      if (currentPoints < reward.PointsRequired) {
        useBtn.disabled = true;
      }

      useBtn.addEventListener("click", handleRedeemClick);
      rewardGridEl.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    rewardGridEl.innerHTML = "<p>Failed to load rewards</p>";
  }
}

// Load the customer's redemption history (their claim receipts to show in person)
// Load the customer's redemption history (their claim receipts to show in person)
async function loadRedemptionHistory() {
  try {
    redemptionListEl.innerHTML = "Loading your redemptions...";

    const response = await fetch(`/redemptions/customer/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      redemptionListEl.innerHTML = "<p>Authentication failed! Please login.</p>";
      return;
    }

    const redemptions = await response.json();

    if (redemptions.length === 0) {
      redemptionListEl.innerHTML = "<p>You haven't redeemed any rewards yet.</p>";
      return;
    }

    redemptionListEl.innerHTML = "";

    redemptions.forEach((redemption) => {
      const item = document.createElement("div");
      item.classList.add("redemption-item");

      const redeemedDate = new Date(redemption.RedeemedDate).toLocaleDateString();

      item.innerHTML = `
        <div class="redemption-header">
          <strong>${redemption.RewardName}</strong>
          <span class="redemption-code">Claim Code: #${redemption.RedemptionID}</span>
        </div>
        <div class="redemption-meta">
          <span>${redemption.PointsUsed} points used</span>
          <span>Redeemed on: ${redeemedDate}</span>
        </div>
        <button data-redemption-id="${redemption.RedemptionID}">Cancel</button>
      `;

      item.querySelector("button").addEventListener("click", handleCancelRedemption);
      redemptionListEl.appendChild(item);
    });
  } catch (error) {
    console.error(error);
    redemptionListEl.innerHTML = "<p>Failed to load redemptions</p>";
  }
}

// Handle clicking "Cancel" on a redemption - deletes it and refunds the points
async function handleCancelRedemption(event) {
  const redemptionId = event.target.getAttribute("data-redemption-id");

  const confirmCancel = confirm("Cancel this redemption? Your points will be refunded.");
  if (!confirmCancel) return;

  try {
    const response = await fetch(`/redemptions/${redemptionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      messageEl.textContent = "Authentication failed! Please login.";
      messageEl.style.color = "red";
      return;
    }

    const data = await response.json();

    if (response.ok) {
      messageEl.textContent = data.message;
      messageEl.style.color = "green";
      loadLoyaltyPoints().then(loadRewards);
      loadRedemptionHistory();
    } else {
      messageEl.textContent = data.error;
      messageEl.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    messageEl.textContent = "Failed to cancel redemption";
    messageEl.style.color = "red";
  }
}

// Handle clicking "Use" on a reward
async function handleRedeemClick(event) {
  const rewardId = event.target.getAttribute("data-reward-id");
  const rewardName = event.target.closest(".reward-card").querySelector("h4").textContent;

  const confirmRedeem = confirm(`Redeem "${rewardName}" using your points?`);
  if (!confirmRedeem) return;

  try {
    const response = await fetch("/redeem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, reward_id: parseInt(rewardId) }),
    });

    if (response.status === 401 || response.status === 403) {
      messageEl.textContent = "Authentication failed! Please login.";
      messageEl.style.color = "red";
      return;
    }

    const data = await response.json();

    if (response.ok) {
      messageEl.textContent = data.message;
      messageEl.style.color = "green";

      // Update the points shown and re-check which rewards are still affordable
      currentPoints = data.loyalty.CurrentPoints;
      pointsValueEl.textContent = currentPoints;
      loadRewards();
      loadRedemptionHistory();
    } else {
      messageEl.textContent = data.error;
      messageEl.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    messageEl.textContent = "Redeem failed";
    messageEl.style.color = "red";
  }
}

window.addEventListener("load", () => {
  loadUserDetails();
  loadLoyaltyPoints().then(loadRewards);
  loadRedemptionHistory();
});