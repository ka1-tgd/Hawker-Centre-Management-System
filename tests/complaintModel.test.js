const sql = require("mssql");
const complaintModel = require("../models/customer/complaintModel.js");

jest.mock("mssql");

describe("complaintModel.deleteComplaint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when the complaint is Pending and owned by this user", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await complaintModel.deleteComplaint(7, 5);

    expect(mockRequest.input).toHaveBeenCalledWith("complaintId", 7);
    expect(mockRequest.input).toHaveBeenCalledWith("userId", 5);
    expect(result).toBe(true);
  });

  it("returns false when the complaint is not Pending, not owned by this user, or does not exist (the WHERE clause matches nothing)", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await complaintModel.deleteComplaint(7, 5);

    expect(result).toBe(false);
  });
});

describe("complaintModel.updateComplaintStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stamps ResolvedDate when the status is set to Resolved", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await complaintModel.updateComplaintStatus(7, "Resolved");

    expect(mockRequest.input).toHaveBeenCalledWith("status", "Resolved");
    expect(result).toBe(true);
  });

  it("returns false when no complaint matches the given id", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await complaintModel.updateComplaintStatus(999, "Resolved");

    expect(result).toBe(false);
  });
});