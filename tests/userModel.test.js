// Require model and mssql
const User = require("../models/userAccount/userModel");
const sql = require("mssql");

// Mock mssql library
jest.mock("mssql");

// Test getUserByUsername
describe("User.getUserByUsername", () => {
    // Clear mocks calls
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should retrieve a user by username", async () => {
        // Arrange
        // Mock user data
        const mockUser = [{
            user_id: 1,
            name: "Me",
            email: "me@test.com",
            contact_no: "12345678",
            role: "customer"
        }];

        // Mock request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: mockUser
            })
        };

        // Mock connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);

        // Act
        // Call model
        const user = await User.getUserByUsername("Me");

        // Assert
        // Check database
        expect(sql.connect).toHaveBeenCalled();
        expect(mockConnection.close).toHaveBeenCalled();

        // Check response
        expect(user.user_id).toBe(1);
        expect(user.name).toBe("Me");
    });

    // Test if user not found
    it("should return null if user is not found", async () => {
        // Arrange
        // Mock request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        // Mock connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);

        // Act
        // Call model
        const user = await User.getUserByUsername("Unknown");

        // Assert
        // Check response
        expect(user).toBeNull();
    });
});

// Test deleteUser
describe("User.deleteUser", () => {
    // Clear mock calls
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete an existing user", async () => {
        // Arrange
        // Mock requests
        const mockRequest1 = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        const mockRequest2 = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        // Mock connection
        const mockConnection = {
            request: jest
                .fn()
                .mockReturnValueOnce(mockRequest1)
                .mockReturnValueOnce(mockRequest2),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);

        // Act
        // Call model
        const result = await User.deleteUser(1);

        // Assert
        // Check result
        expect(result).toBe(true);
        expect(mockConnection.close).toHaveBeenCalled();
    });
});

// Test updateUser
describe("User.updateUser", () => {
    // Clear mock calls
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update and return the updated user", async () => {
        // Arrange
        // Mock user data
        const updatedUser = {
            user_id: 1,
            name: "Me",
            email: "me@test.com",
            contact_no: "87654321",
            role: "customer"
        };

        // Mokc requests
        const updateRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        const selectRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [updatedUser]
            })
        };

        // Mock connection
        const mockConnection = {
            request: jest.fn()
                .mockReturnValueOnce(updateRequest)
                .mockReturnValueOnce(selectRequest),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);

        // Act
        // Call model
        const user = await User.updateUser(1, updatedUser);

        // Assert
        // Check response
        expect(user.name).toBe("Me");
        expect(user.contact_no).toBe("87654321");
    });
});