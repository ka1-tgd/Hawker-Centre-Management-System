const sql = require("mssql");
const feedbackModel = require("../models/customerEngagement/feedbackModel.js");

jest.mock("mssql");

describe("feedbackModel.createFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws a 400 error if feedback already exists for this order", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ recordset: [{ FeedbackID: 1 }] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const feedback = { order_id: 10, user_id: 1, stall_id: 1, Rating: 5, Comment: "Great food" };

    await expect(feedbackModel.createFeedback(feedback)).rejects.toThrow(
      "Feedback has already been submitted for this order"
    );
    expect(mockRequest.query).toHaveBeenCalledTimes(1);
  });

  it("throws an error object with status 400 (not a generic 500)", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ recordset: [{ FeedbackID: 1 }] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const feedback = { order_id: 10, user_id: 1, stall_id: 1, Rating: 5 };

    try {
      await feedbackModel.createFeedback(feedback);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });
});