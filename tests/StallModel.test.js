const StallModel = require("../models/vendor/StallModel");
const sql = require("mssql");

jest.mock("mssql");

describe("StallModel", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ============================================
    // getLoginUserStalls
    // ============================================

    describe("getLoginUserStalls", () => {

        it("should retrieve all stalls of a user", async () => {

            const mockStalls = [
                {
                    stall_id: 1,
                    stall_name: "Chicken Rice"
                },
                {
                    stall_id: 2,
                    stall_name: "Nasi Lemak"
                }
            ];

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({
                    recordset: mockStalls
                })
            };

            const mockConnection = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue()
            };

            sql.connect.mockResolvedValue(mockConnection);

            const stalls = await StallModel.getLoginUserStalls(9);

            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.input).toHaveBeenCalledWith("user_id", 9);
            expect(stalls).toHaveLength(2);
            expect(stalls[0].stall_name).toBe("Chicken Rice");
            expect(mockConnection.close).toHaveBeenCalled();

        });

        it("should throw database error", async () => {

            sql.connect.mockRejectedValue(
                new Error("Database Error")
            );

            await expect(
                StallModel.getLoginUserStalls(9)
            ).rejects.toThrow("Database Error");

        });

    });

    // ============================================
    // getStallById
    // ============================================

    describe("getStallById", () => {

        it("should return one stall", async () => {

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({
                    recordset: [
                        {
                            stall_id: 1,
                            stall_name: "Chicken Rice"
                        }
                    ]
                })
            };

            const mockConnection = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue()
            };

            sql.connect.mockResolvedValue(mockConnection);

            const stall = await StallModel.getStallById(1, 9);

            expect(stall.stall_id).toBe(1);
            expect(stall.stall_name).toBe("Chicken Rice");
            expect(mockConnection.close).toHaveBeenCalled();

        });

        it("should return null if stall not found", async () => {

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({
                    recordset: []
                })
            };

            const mockConnection = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue()
            };

            sql.connect.mockResolvedValue(mockConnection);

            const stall = await StallModel.getStallById(1, 9);

            expect(stall).toBeNull();
            expect(mockConnection.close).toHaveBeenCalled();

        });

    });

    // ============================================
    // createStall
    // ============================================

    describe("createStall", () => {

        it("should create a stall", async () => {

            const stallData = {
                hawker_centre_id: 1,
                stall_name: "New Stall",
                description: "Test",
                operating_hours: "9AM-9PM",
                contact_number: "91234567",
                status: "Open"
            };

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn()
                    // MAX stall_id
                    .mockResolvedValueOnce({
                        recordset: [{ stall_id: 10 }]
                    })

                    // INSERT Stall
                    .mockResolvedValueOnce({})

                    // MAX menu_id
                    .mockResolvedValueOnce({
                        recordset: [{ menu_id: 10 }]
                    })

                    // INSERT Menu
                    .mockResolvedValueOnce({})

                    // MAX agreement_id
                    .mockResolvedValueOnce({
                        recordset: [{ agreement_id: 10 }]
                    })

                    // INSERT Rental
                    .mockResolvedValueOnce({})

                    // getStallById()
                    .mockResolvedValueOnce({
                        recordset: [{
                            stall_id: 10,
                            stall_name: "New Stall"
                        }]
                    })
            };

            const mockConnection = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue()
            };

            sql.connect.mockResolvedValue(mockConnection);

            const stall = await StallModel.createStall(9, stallData);

            expect(stall.stall_id).toBe(10);
            expect(stall.stall_name).toBe("New Stall");

            expect(mockRequest.query).toHaveBeenCalledTimes(7);
            expect(mockConnection.close).toHaveBeenCalled();

        });

    });

    // ============================================
    // updateStall
    // ============================================

    describe("updateStall", () => {

        it("should update a stall", async () => {

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn()

                    // UPDATE
                    .mockResolvedValueOnce({
                        rowsAffected: [1]
                    })

                    // getStallById()
                    .mockResolvedValueOnce({
                        recordset: [{
                            stall_id: 1,
                            stall_name: "Updated Stall"
                        }]
                    })
            };

            const mockConnection = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue()
            };

            sql.connect.mockResolvedValue(mockConnection);

            const result = await StallModel.updateStall(
                1,
                9,
                {
                    stall_name: "Updated Stall",
                    description: "desc",
                    operating_hours: "9AM",
                    contact_number: "91234567",
                    status: "Open"
                }
            );

            expect(result.stall_name).toBe("Updated Stall");
            expect(mockRequest.query).toHaveBeenCalledTimes(2);
            expect(mockConnection.close).toHaveBeenCalled();

        });

        it("should return null if no stall updated", async () => {

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({
                    rowsAffected: [0]
                })
            };

            const mockConnection = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue()
            };

            sql.connect.mockResolvedValue(mockConnection);

            const result = await StallModel.updateStall(
                1,
                9,
                {}
            );

            expect(result).toBeNull();
            expect(mockConnection.close).toHaveBeenCalled();

        });

    });

    // ============================================
    // deleteStall
    // ============================================

    describe("deleteStall", () => {

        it("should delete a stall", async () => {

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn()

                    // Delete MenuItem
                    .mockResolvedValueOnce({})

                    // Delete Menu
                    .mockResolvedValueOnce({})

                    // Delete RentalAgreement
                    .mockResolvedValueOnce({})

                    // Delete Stall
                    .mockResolvedValueOnce({
                        rowsAffected: [1]
                    })
            };

            const mockConnection = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue()
            };

            sql.connect.mockResolvedValue(mockConnection);

            const deleted = await StallModel.deleteStall(1, 9);

            expect(deleted).toBe(true);
            expect(mockRequest.query).toHaveBeenCalledTimes(4);
            expect(mockConnection.close).toHaveBeenCalled();

        });

        it("should return false if stall does not exist", async () => {

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn()

                    .mockResolvedValueOnce({})
                    .mockResolvedValueOnce({})
                    .mockResolvedValueOnce({})
                    .mockResolvedValueOnce({
                        rowsAffected: [0]
                    })
            };

            const mockConnection = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue()
            };

            sql.connect.mockResolvedValue(mockConnection);

            const deleted = await StallModel.deleteStall(999, 9);

            expect(deleted).toBe(false);
            expect(mockRequest.query).toHaveBeenCalledTimes(4);
            expect(mockConnection.close).toHaveBeenCalled();

        });

    });

});