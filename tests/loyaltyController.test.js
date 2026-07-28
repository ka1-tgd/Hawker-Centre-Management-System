const loyaltyController = require("../controllers/customerEngagement/loyaltyController.js");
const loyaltyModel = require("../models/customerEngagement/loyaltyModel.js");

jest.mock("../models/customerEngagement/loyaltyModel.js");

describe("loyaltyController.redeemReward", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 if the reward does not exist", async () => {
    loyaltyModel.getRewardById.mockResolvedValue(null);
    const req = { body: { user_id: 1, reward_id: 99 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await loyaltyController.redeemReward(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Reward not found or no longer active" });
  });

  it("returns 404 if the reward is inactive", async () => {
    loyaltyModel.getRewardById.mockResolvedValue({
      RewardID: 6, RewardName: "Free Meal Set", PointsRequired: 300, IsActive: "Inactive",
    });
    const req = { body: { user_id: 1, reward_id: 6 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await loyaltyController.redeemReward(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 400 if the customer does not have enough points", async () => {
    loyaltyModel.getRewardById.mockResolvedValue({
      RewardID: 3, RewardName: "5% Discount Voucher", PointsRequired: 100, IsActive: "Active",
    });
    loyaltyModel.getLoyaltyPoints.mockResolvedValue({ CurrentPoints: 50, Tier: "Bronze" });
    const req = { body: { user_id: 1, reward_id: 3 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await loyaltyController.redeemReward(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Not enough points to redeem this reward" });
    expect(loyaltyModel.redeemReward).not.toHaveBeenCalled();
  });

  it("redeems successfully when the customer has enough points", async () => {
    loyaltyModel.getRewardById.mockResolvedValue({
      RewardID: 1, RewardName: "Free Drink", PointsRequired: 50, IsActive: "Active",
    });
    loyaltyModel.getLoyaltyPoints.mockResolvedValue({ CurrentPoints: 130, Tier: "Silver" });
    loyaltyModel.redeemReward.mockResolvedValue({ CurrentPoints: 80, Tier: "Bronze" });
    const req = { body: { user_id: 1, reward_id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await loyaltyController.redeemReward(req, res);

    expect(loyaltyModel.redeemReward).toHaveBeenCalledWith(1, 1, 50);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Free Drink redeemed successfully!",
      loyalty: { CurrentPoints: 80, Tier: "Bronze" },
    });
  });
});