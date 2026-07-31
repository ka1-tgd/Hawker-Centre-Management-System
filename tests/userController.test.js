// Require controller, model and bcryptjs
const userController = require("../controllers/userAccount/userController");
const userModel = require("../models/userAccount/userModel");
const bcrypt = require("bcryptjs");

// Mock model and bcryptjs
jest.mock("../models/userAccount/userModel");
jest.mock("bcryptjs");

// Test getUserByUsername
describe("getUserByUsername", () => {
    // Clear mock calls
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a user", async () => {
        // Arrange
        // Mock user data
        const user = {
            user_id: 1,
            name: "Me"
        };

        userModel.getUserByUsername.mockResolvedValue(user);

        // Create req
        const req = {
            params: {
                name: "Me"
            }
        };

        // Create res
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Act
        // Call controller
        await userController.getUserByUsername(req, res);

        // Assert
        // Check model
        expect(userModel.getUserByUsername).toHaveBeenCalledWith("Me");

        // Check response
        expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return 404 when user is not found", async () => {
        // Arrange
        // Mock model
        userModel.getUserByUsername.mockResolvedValue(null);

        // Create req
        const req = {
            params: { 
                name: "Not Me" 
            }
        };

        // Create res
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Act
        // Call controller
        await userController.getUserByUsername(req, res);

        // Assert
        // Check response
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: "User not found"
        });
    });

    it("should return 500 when model throws error", async () => {
        // Arrange
        // Mock model
        userModel.getUserByUsername.mockRejectedValue(
            new Error("Database error")
        );

        // Create req
        const req = {
            params: {
                name: "Me" 
            }
        };

        // Create res
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        
        // Act
        // Call controller
        await userController.getUserByUsername(req, res);

        // Assert
        // Check response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Error retrieving user"
        });
    });
});

// Test createUser
describe("createUser", () => {
    // Clear mock calls
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new user", async () => {
        // Arrange
        // Mock salt and hashed password
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashedPassword");

        userModel.getUserByUsername.mockResolvedValue(null);

        // Mock user data
        const newUser = {
            user_id: 1,
            name: "Me"
        };

        userModel.createUser.mockResolvedValue(newUser);

        // Create req
        const req = {
            body: {
                name: "Me",
                password: "password123"
            }
        };

        // Create res
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Act
        // Call controller
        await userController.createUser(req, res);

        // Assert
        // Check model
        expect(userModel.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Me",
                password: "hashedPassword"
            })
        );

        // Check response
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(newUser);
    });
});

// Test deleteUser
describe("deleteUser", () => {
    // Clear mock calls
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete a user", async () => {
        // Arrange
        /// Mock model
        userModel.deleteUser.mockResolvedValue(true);

        // Create req
        const req = {
            params: {
                id: "1"
            }
        };

        // Create res
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        // Act
        // Call controller
        await userController.deleteUser(req, res);

        // Assert
        // Chekc model
        expect(userModel.deleteUser).toHaveBeenCalledWith(1);

        // Check response
        expect(res.status).toHaveBeenCalledWith(200);
    });
});