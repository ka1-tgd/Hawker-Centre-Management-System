const sql = require("mssql");
const inspectionModel = require("../models/nea-officer/inspectionModel.js");

// --- Pure function test (no database involved) ---
describe("inspectionModel.calculateGrade", () => {
  it("returns A for a score of 90 or above", () => {
    expect(inspectionModel.calculateGrade(90)).toBe("A");
    expect(inspectionModel.calculateGrade(100)).toBe("A");
  });

  it("returns B for a score between 75 and 89", () => {
    expect(inspectionModel.calculateGrade(75)).toBe("B");
    expect(inspectionModel.calculateGrade(89)).toBe("B");
  });

  it("returns C for a score between 60 and 74", () => {
    expect(inspectionModel.calculateGrade(60)).toBe("C");
    expect(inspectionModel.calculateGrade(74)).toBe("C");
  });

  it("returns D for a score below 60", () => {
    expect(inspectionModel.calculateGrade(59)).toBe("D");
    expect(inspectionModel.calculateGrade(0)).toBe("D");
  });

  it("returns B right at the boundary just above C (75, the real edge case)", () => {
    expect(inspectionModel.calculateGrade(74)).toBe("C");
    expect(inspectionModel.calculateGrade(75)).toBe("B");
  });
});

// --- Database-hitting function tests (mssql mocked) ---
jest.mock("mssql");

describe("inspectionModel.createInspection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inserts the inspection then inserts a matching hygiene grade record", async () => {
    const mockInspectionRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ recordset: [{ inspection_id: 5 }] }),
    };
    const mockGradeRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({}),
    };
    const mockConnection = {
      request: jest
        .fn()
        .mockReturnValueOnce(mockInspectionRequest)
        .mockReturnValueOnce(mockGradeRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const inspectionData = {
      stall_id: 1,
      officer_id: 3,
      inspection_date: "2026-07-20",
      score: 82,
      remarks: "Test remarks",
    };

    const result = await inspectionModel.createInspection(inspectionData);

    // The inspection insert query and the hygiene grade insert query
    // should both have been run exactly once
    expect(mockInspectionRequest.query).toHaveBeenCalledTimes(1);
    expect(mockGradeRequest.query).toHaveBeenCalledTimes(1);

    // The grade should be calculated correctly from the score (82 = B)
    expect(result).toEqual({ inspection_id: 5, grade: "B" });
  });

  it("closes the database connection even if an error occurs", async () => {
    const mockConnection = {
      request: jest.fn().mockReturnValue({
        input: jest.fn(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
      }),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    await expect(
      inspectionModel.createInspection({ stall_id: 1, officer_id: 3, inspection_date: "2026-07-20", score: 50 })
    ).rejects.toThrow("Database error");

    expect(mockConnection.close).toHaveBeenCalledTimes(1);
  });
});

describe("inspectionModel.deleteInspection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when a row was actually deleted", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await inspectionModel.deleteInspection(1);

    expect(result).toBe(true);
  });

  it("returns false when no matching inspection was found", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await inspectionModel.deleteInspection(999);

    expect(result).toBe(false);
  });
});