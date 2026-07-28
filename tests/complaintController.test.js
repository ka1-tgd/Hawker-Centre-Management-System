// ============================================================
// Unit tests for complaintController
// Same mocking pattern as inspectionController.test.js.
// ============================================================

const complaintController = require("../controllers/customer/complaintController");
const complaintModel = require("../models/customer/complaintModel");

jest.mock("../models/customer/complaintModel");

describe("complaintController.createComplaint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a complaint and return 201", async () => {
    complaintModel.createComplaint.mockResolvedValue({ ComplaintID: 7 });

    const req = {
      body: {
        order_id: 1,
        user_id: 5,
        stall_id: 1,
        category: "Hygiene",
        description: "Test complaint",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await complaintController.createComplaint(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ComplaintID: 7 });
  });
});

describe("complaintController.deleteComplaint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a pending complaint owned by the logged-in user", async () => {
    complaintModel.deleteComplaint.mockResolvedValue(true);

    // req.user comes from the verified JWT, not the URL or body
    const req = { params: { id: "7" }, user: { id: 5 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await complaintController.deleteComplaint(req, res);

    expect(complaintModel.deleteComplaint).toHaveBeenCalledWith(7, 5);
    expect(res.json).toHaveBeenCalledWith({ message: "Complaint deleted successfully" });
  });

  it("should return 404 when the complaint is not pending, not owned, or does not exist", async () => {
    complaintModel.deleteComplaint.mockResolvedValue(false);

    const req = { params: { id: "7" }, user: { id: 5 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await complaintController.deleteComplaint(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
