const salesController = require("../controllers/vendor/salesController");
const salesModel = require("../models/vendor/salesModel");

jest.mock("../models/vendor/salesModel");

describe("salesController.getRevenueSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return revenue summary for a stall", async () => {
    const mockSummary = { total_revenue: 150.5, total_orders: 12 };
    salesModel.getRevenueSummary.mockResolvedValue(mockSummary);

    const req = { params: { stallId: "1" } };
    const res = { json: jest.fn() };

    await salesController.getRevenueSummary(req, res);

    expect(salesModel.getRevenueSummary).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(mockSummary);
  });

  it("should return 500 if the model throws an error", async () => {
    salesModel.getRevenueSummary.mockRejectedValue(new Error("Database error"));

    const req = { params: { stallId: "1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await salesController.getRevenueSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error retrieving revenue summary" });
  });
});

describe("salesController.getPopularItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return popular items for a stall", async () => {
    const mockItems = [{ item_name: "Roasted Chicken Rice", total_quantity: 20 }];
    salesModel.getPopularItems.mockResolvedValue(mockItems);

    const req = { params: { stallId: "1" } };
    const res = { json: jest.fn() };

    await salesController.getPopularItems(req, res);

    expect(res.json).toHaveBeenCalledWith(mockItems);
  });
});

describe("salesController.getPopularItemsChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a chart URL", async () => {
    salesModel.generatePopularItemsChart.mockResolvedValue("https://quickchart.io/chart/abc123");

    const req = { params: { stallId: "1" } };
    const res = { json: jest.fn() };

    await salesController.getPopularItemsChart(req, res);

    expect(res.json).toHaveBeenCalledWith({ chartUrl: "https://quickchart.io/chart/abc123" });
  });

  it("should return 500 if chart generation fails", async () => {
    salesModel.generatePopularItemsChart.mockRejectedValue(new Error("QuickChart API error"));

    const req = { params: { stallId: "1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await salesController.getPopularItemsChart(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
