const customerController = require("../controllers/customer/customerController");
const customerModel = require("../models/customer/customerModel");

jest.mock("../models/customer/customerModel");

describe("customerController - Core Order Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. getOrderById
  describe("getOrderById", () => {
    it("should return an order with status 200 when found", async () => {
      const mockOrder = { order_id: 1, total: 50 };
      customerModel.getOrderById.mockResolvedValue(mockOrder);

      const req = { params: { order_id: "1" } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await customerController.getOrderById(req, res);

      expect(customerModel.getOrderById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    it("should return 404 when order is not found", async () => {
      customerModel.getOrderById.mockResolvedValue(null);

      const req = { params: { order_id: "99" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Order not found" });
    });

    it("should return 500 on database error", async () => {
      customerModel.getOrderById.mockRejectedValue(new Error("DB error"));

      const req = { params: { order_id: "1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error retrieving order" });
    });
  });

  // 2. createOrder
  describe("createOrder", () => {
    it("should create an order and return 201", async () => {
      const newOrderData = { order_id: 10, stall_id: 1 };
      customerModel.createOrder.mockResolvedValue(newOrderData);

      const req = { body: { stall_id: 1, items: [] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newOrderData);
    });

    it("should return 400 if stall is closed or items unavailable", async () => {
      customerModel.createOrder.mockRejectedValue(new Error("The stall is currently closed"));

      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "The stall is currently closed" });
    });

    it("should return 500 on general creation error", async () => {
      customerModel.createOrder.mockRejectedValue(new Error("Database crash"));

      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error creating order" });
    });
  });

  // 3. deleteOrder
  describe("deleteOrder", () => {
    it("should delete an order and return the result", async () => {
      customerModel.deleteOrder.mockResolvedValue({ success: true });

      const req = { params: { order_id: "1" } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await customerController.deleteOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should return 404 if order to delete is not found", async () => {
      customerModel.deleteOrder.mockResolvedValue(null);

      const req = { params: { order_id: "99" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.deleteOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "order not found" });
    });

    it("should return 400 if cancellation is restricted", async () => {
      customerModel.deleteOrder.mockRejectedValue(new Error("Cannot cancel order once preparing"));

      const req = { params: { order_id: "1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.deleteOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Cannot cancel order once preparing" });
    });

    it("should return 500 on delete error", async () => {
      customerModel.deleteOrder.mockRejectedValue(new Error("DB error"));

      const req = { params: { order_id: "1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.deleteOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error deleting order" });
    });
  });

  // 4. updateOrderItemQuantity
  describe("updateOrderItemQuantity", () => {
    it("should update quantity and return 200", async () => {
      const mockUpdated = { order_id: 1, order_item_no: 2, quantity: 5 };
      customerModel.updateOrderItemQuantity.mockResolvedValue(mockUpdated);

      const req = { params: { order_id: "1", order_item_no: "2" }, body: { quantity: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.updateOrderItemQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it("should return 404 if order not found during update", async () => {
      customerModel.updateOrderItemQuantity.mockResolvedValue(null);

      const req = { params: { order_id: "99", order_item_no: "2" }, body: { quantity: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.updateOrderItemQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Order ID 99 not found." });
    });

    it("should return 400 for bad update criteria messages", async () => {
      customerModel.updateOrderItemQuantity.mockRejectedValue(
        new Error("update only available for status pending")
      );

      const req = { params: { order_id: "1", order_item_no: "2" }, body: { quantity: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.updateOrderItemQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "update only available for status pending" });
    });

    it("should return 500 on unexpected update error", async () => {
      customerModel.updateOrderItemQuantity.mockRejectedValue(new Error("Unexpected DB crash"));

      const req = { params: { order_id: "1", order_item_no: "2" }, body: { quantity: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await customerController.updateOrderItemQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "An internal server error occurred while updating the item quantity." });
    });
  });
});