const { calculateTier } = require("../models/customerEngagement/loyaltyModel.js");

describe("calculateTier", () => {
  it("returns Bronze for 0 points", () => {
    expect(calculateTier(0)).toBe("Bronze");
  });

  it("returns Bronze for points just under the Silver threshold (99)", () => {
    expect(calculateTier(99)).toBe("Bronze");
  });

  it("returns Silver at exactly the Silver threshold (100)", () => {
    expect(calculateTier(100)).toBe("Silver");
  });

  it("returns Silver for 130 points (the real bug this was written for)", () => {
    expect(calculateTier(130)).toBe("Silver");
  });

  it("returns Silver for points just under the Gold threshold (249)", () => {
    expect(calculateTier(249)).toBe("Silver");
  });

  it("returns Gold at exactly the Gold threshold (250)", () => {
    expect(calculateTier(250)).toBe("Gold");
  });

  it("returns Gold for a large points value (999)", () => {
    expect(calculateTier(999)).toBe("Gold");
  });
});