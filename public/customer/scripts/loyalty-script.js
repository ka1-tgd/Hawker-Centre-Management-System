// userId is declared once in account.html and shared by every script on this page

const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userContactEl = document.getElementById("userContact");
const pointsValueEl = document.getElementById("pointsValue");
const tierLabelEl = document.getElementById("tierLabel");
const progressFillEl = document.getElementById("progressFill");
const rewardGridEl = document.getElementById("rewardGrid");
const messageEl = document.getElementById("message");

// Points required to REACH each tier 
const tierThresholds = { Bronze: 0, Silver: 100, Gold: 250 };
const tierOrder = ["Bronze", "Silver", "Gold"];

let currentPoints = 0;

// Load the user's profile details 
async function loadUserDetails() {
  try {
    const response = await fetch(`/profile/${userId}`);

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
    const response = await fetch(`/loyalty/${userId}`);

    if (response.status === 401 || response.status === 403) {
      tierLabelEl.textContent = "Authentication failed! Please login.";
      return;
    }

    const loyalty = await response.json();

    currentPoints = loyalty.CurrentPoints;
    pointsValueEl.textContent = currentPoints;
    tierLabelEl.textContent = `Current Tier: ${loyalty.Tier}`;

    // Find the tier after the current one 
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
    const response = await fetch("/rewards");

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

      // Grey out (and disable) rewards the user can't afford yet
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

// Handle clicking "Use" on a reward
async function handleRedeemClick(event) {
  const rewardId = event.target.getAttribute("data-reward-id");
  const rewardName = event.target.closest(".reward-card").querySelector("h4").textContent;

  const confirmRedeem = confirm(`Redeem "${rewardName}" using your points?`);
  if (!confirmRedeem) return;

  try {
    const response = await fetch("/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
});