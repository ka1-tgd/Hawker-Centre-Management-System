const vendorDashboardController = require("../controllers/customerEngagement/vendorDashboardController.js");
const vendorDashboardModel = require("../models/customerEngagement/vendorDashboardModel.js");

jest.mock("../models/customerEngagement/vendorDashboardModel.js");

describe("vendorDashboardController.resolveComplaint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 if the complaint does not exist", async () => {
    vendorDashboardModel.resolveComplaint.mockResolvedValue(false);
    const req = { params: { id: "99" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await vendorDashboardController.resolveComplaint(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Complaint not found" });
  });

  it("marks the complaint as resolved when it exists", async () => {
    vendorDashboardModel.resolveComplaint.mockResolvedValue(true);
    const req = { params: { id: "1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await vendorDashboardController.resolveComplaint(req, res);

    expect(vendorDashboardModel.resolveComplaint).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ message: "Complaint marked as resolved" });
  });
});