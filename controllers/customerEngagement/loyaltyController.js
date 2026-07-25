const loyaltyModel = require("../../models/customerEngagement/loyaltyModel.js");

// Get a customer's loyalty points and tier
async function getLoyaltyPoints(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const loyalty = await loyaltyModel.getLoyaltyPoints(userId);

    if (!loyalty) {
      return res.status(404).json({ error: "Loyalty record not found for this user" });
    }

    res.json(loyalty);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving loyalty points" });
  }
}

// Get all rewards that are currently active
async function getRewards(req, res) {
  try {
    const rewards = await loyaltyModel.getActiveRewards();
    res.json(rewards);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving rewards" });
  }
}

// Redeem a reward (deduct points + log to RedemptionHistory)
async function redeemReward(req, res) {
  try {
    const { user_id, reward_id } = req.body;

    const reward = await loyaltyModel.getRewardById(reward_id);
    if (!reward || reward.IsActive === "Inactive") {
      return res.status(404).json({ error: "Reward not found or no longer active" });
    }

    const loyalty = await loyaltyModel.getLoyaltyPoints(user_id);
    if (!loyalty) {
      return res.status(404).json({ error: "Loyalty record not found for this user" });
    }

    if (loyalty.CurrentPoints < reward.PointsRequired) {
      return res.status(400).json({ error: "Not enough points to redeem this reward" });
    }

    const updatedLoyalty = await loyaltyModel.redeemReward(
      user_id,
      reward_id,
      reward.PointsRequired
    );

    res.status(201).json({
      message: `${reward.RewardName} redeemed successfully!`,
      loyalty: updatedLoyalty,
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error redeeming reward" });
  }
}

// Get a customer's redemption history (their claim codes / vouchers)
async function getRedemptionHistory(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const history = await loyaltyModel.getRedemptionHistory(userId);
    res.json(history);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving redemption history" });
  }
}

// Cancel a redemption (before it's claimed in person) and refund the points used
async function deleteRedemption(req, res) {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;

    const redemption = await loyaltyModel.getRedemptionById(id);
    if (!redemption) {
      return res.status(404).json({ error: "Redemption not found" });
    }

    if (redemption.user_id !== userId) {
      return res.status(403).json({ error: "You can only cancel your own redemptions" });
    }

    const cancelled = await loyaltyModel.deleteRedemption(id, userId, redemption.PointsUsed);
    if (!cancelled) {
      return res.status(404).json({ error: "Redemption not found" });
    }

    res.json({ message: "Redemption cancelled and points refunded" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error cancelling redemption" });
  }
}

// Vendor looks up a claim code before confirming
async function getRedemptionDetails(req, res) {
  try {
    const id = parseInt(req.params.id);
    const redemption = await loyaltyModel.getRedemptionWithRewardDetails(id);

    if (!redemption) {
      return res.status(404).json({ error: "Claim code not found or already used" });
    }

    res.json(redemption);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving redemption details" });
  }
}

// Vendor marks a redemption as claimed after the customer shows their claim code
async function claimRedemption(req, res) {
  try {
    const id = parseInt(req.params.id);

    const redemption = await loyaltyModel.getRedemptionById(id);
    if (!redemption) {
      return res.status(404).json({ error: "Claim code not found or already used" });
    }

    await loyaltyModel.claimRedemption(id);

    res.json({ message: "Redemption marked as claimed successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error claiming redemption" });
  }
}

// Get a customer's basic profile info for the account page
async function getUserProfile(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await loyaltyModel.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving user profile" });
  }
}

module.exports = {
  getLoyaltyPoints,
  getRewards,
  redeemReward,
  getRedemptionHistory,
  deleteRedemption,
  getRedemptionDetails,
  claimRedemption,
  getUserProfile,
};