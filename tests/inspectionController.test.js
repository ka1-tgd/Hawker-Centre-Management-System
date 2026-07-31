// ============================================================
// Unit tests for inspectionController
// Follows the Practical09 pattern: mock the model layer so these
// tests run without a real database connection, then verify the
// controller calls the model correctly and returns the right
// HTTP status/response for both success and error cases.
// ============================================================

const inspectionController = require("../controllers/nea-officer/inspectionController");
const inspectionModel = require("../models/nea-officer/inspectionModel");

// Replace the real model with a Jest mock
jest.mock("../models/nea-officer/inspectionModel");

describe("inspectionController.getInspectionsByStall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch inspections for a stall and return them as JSON", async () => {
    const mockInspections = [
      { inspection_id: 1, score: 92, grade: "A" },
      { inspection_id: 2, score: 78, grade: "B" },
    ];

    inspectionModel.getInspectionsByStall.mockResolvedValue(mockInspections);

    const req = { params: { stallId: "1" } };
    const res = { json: jest.fn() };

    await inspectionController.getInspectionsByStall(req, res);

    expect(inspectionModel.getInspectionsByStall).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(mockInspections);
  });

  it("should return a 500 status when the model throws an error", async () => {
    inspectionModel.getInspectionsByStall.mockRejectedValue(new Error("Database error"));

    const req = { params: { stallId: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await inspectionController.getInspectionsByStall(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error retrieving inspections" });
  });
});

describe("inspectionController.createInspection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an inspection using the logged-in officer's id from the JWT, ignoring any officer_id sent in the body", async () => {
    const mockNewInspection = { inspection_id: 5, grade: "B" };
    inspectionModel.createInspection.mockResolvedValue(mockNewInspection);

    const req = {
      body: {
        stall_id: 1,
        officer_id: 999, // attempting to impersonate another officer
        inspection_date: "2026-07-20",
        score: 82,
        remarks: "Test remarks",
      },
      user: { id: 3, role: "officer" }, // the actual logged-in officer
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await inspectionController.createInspection(req, res);

    // The model should have been called with officer_id 3 (from the
    // token), not 999 (the spoofed value from the request body)
    expect(inspectionModel.createInspection).toHaveBeenCalledWith(
      expect.objectContaining({ officer_id: 3 })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockNewInspection);
  });

  it("should return a 500 status when creation fails", async () => {
    inspectionModel.createInspection.mockRejectedValue(new Error("Database error"));

    const req = { body: {}, user: { id: 3, role: "officer" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await inspectionController.createInspection(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error creating inspection" });
  });
});

describe("inspectionController.updateInspection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update an inspection and return the updated record", async () => {
    const mockUpdated = { inspection_id: 1, grade: "A" };
    inspectionModel.updateInspection.mockResolvedValue(mockUpdated);

    const req = { params: { id: "1" }, body: { score: 95, remarks: "Improved" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await inspectionController.updateInspection(req, res);

    expect(inspectionModel.updateInspection).toHaveBeenCalledWith(1, req.body);
    expect(res.json).toHaveBeenCalledWith(mockUpdated);
  });

  it("should return 404 when the inspection does not exist", async () => {
    inspectionModel.updateInspection.mockResolvedValue(null);

    const req = { params: { id: "999" }, body: { score: 95 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await inspectionController.updateInspection(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Inspection not found" });
  });
});

describe("inspectionController.deleteInspection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete an inspection and return a success message", async () => {
    inspectionModel.deleteInspection.mockResolvedValue(true);

    const req = { params: { id: "1" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await inspectionController.deleteInspection(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Inspection deleted successfully" });
  });

  it("should return 404 when the inspection does not exist", async () => {
    inspectionModel.deleteInspection.mockResolvedValue(false);

    const req = { params: { id: "999" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await inspectionController.deleteInspection(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
