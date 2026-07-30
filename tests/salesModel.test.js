const axios = require("axios");
const sql = require("mssql");
const salesModel = require("../models/vendor/salesModel.js");

jest.mock("mssql");
jest.mock("axios");

describe("salesModel.getRevenueSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the total revenue and order count for a stall", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({
        recordset: [{ total_revenue: 150.5, total_orders: 12 }],
      }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await salesModel.getRevenueSummary(1);

    expect(mockRequest.input).toHaveBeenCalledWith("stallId", 1);
    expect(result).toEqual({ total_revenue: 150.5, total_orders: 12 });
  });
});

describe("salesModel.generatePopularItemsChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds a chart config from the popular items and calls the QuickChart API", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          { item_name: "Roasted Chicken Rice", total_quantity: 20 },
          { item_name: "Chicken Soup", total_quantity: 8 },
        ],
      }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    axios.post.mockResolvedValue({
      data: { url: "https://quickchart.io/chart/abc123" },
    });

    const chartUrl = await salesModel.generatePopularItemsChart(1);

    // QuickChart should be called with the item names/quantities as chart data
    const chartConfigSent = axios.post.mock.calls[0][1].chart;
    expect(chartConfigSent.data.labels).toEqual(["Roasted Chicken Rice", "Chicken Soup"]);
    expect(chartConfigSent.data.datasets[0].data).toEqual([20, 8]);
    expect(chartUrl).toBe("https://quickchart.io/chart/abc123");
  });

  it("throws an error if the QuickChart API call fails", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    axios.post.mockRejectedValue(new Error("QuickChart API error"));

    await expect(salesModel.generatePopularItemsChart(1)).rejects.toThrow("QuickChart API error");
  });
});