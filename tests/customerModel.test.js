const sql = require("mssql");
const customerModel = require("../models/customer/customerModel");

jest.mock("mssql");

describe("customerModel Tests", () => {
  let mockRequest;
  let mockConnection;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
    };

    mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection);
    sql.Request.mockImplementation(() => mockRequest);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  //getOrderById
  describe("customerModel.getOrderById", () => {
    it("should return formatted order details when found", async () => {
      const dbRows = [
        {
          order_id: 1,
          user_id: 5,
          order_date: "2026-06-01",
          total_amount: 15.0,
          payment_type: "Cash",
          status: "Pending",
          order_item_no: 1,
          stall_id: 2,
          menu_item_id: 10,
          item_name: "Chicken Rice",
          quantity: 2,
          unit_price: 7.5,
        },
      ];

      mockRequest.query.mockResolvedValueOnce({ recordset: dbRows });

      const result = await customerModel.getOrderById(1);

      expect(sql.connect).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith("order_id", sql.Int, 1);
      expect(result).toHaveLength(1);
      expect(result[0].order_id).toBe(1);
      expect(result[0].order_items).toHaveLength(1);
      expect(result[0].order_items[0].item_name).toBe("Chicken Rice");
    });

    it("should return null if order is not found", async () => {
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });

      const result = await customerModel.getOrderById(99);

      expect(result).toBeNull();
    });
  });

  //createOrder
  describe("customerModel.createOrder", () => {
    it("should successfully create an order when stall is open and item available", async () => {
      //query 1: check item info/stall status
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ price: 5.0, availability: "Y", stall_id: 1, status: "Open" }],
      });
      //query 2: INSERT into CustOrder & get SCOPE_IDENTITY()
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ order_id: 10 }],
      });
      //query 3: INSERT into OrderItem
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      //query 4: UPDATE total_amount
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      
      //query 5 onwards: called inside the recursive getOrderById(10) call
      mockRequest.query.mockResolvedValueOnce({
        recordset: [
          {
            order_id: 10,
            user_id: 2,
            order_date: "2026-06-01",
            total_amount: 5.0,
            payment_type: "Online",
            status: "Pending",
            order_item_no: 1,
            stall_id: 1,
            menu_item_id: 4,
            item_name: "Noodles",
            quantity: 1,
            unit_price: 5.0,
          },
        ],
      });

      const newOrderPayload = {
        user_id: 2,
        payment_type: "Online",
        order_items: [{ menu_item_id: 4, quantity: 1 }],
      };

      const result = await customerModel.createOrder(newOrderPayload);

      expect(result).toBeDefined();
      expect(result[0].order_id).toBe(10);
    });

    it("should throw an error if the stall is closed", async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ price: 5.0, availability: "Y", stall_id: 1, status: "Closed" }],
      });

      const newOrderPayload = {
        user_id: 2,
        payment_type: "Online",
        order_items: [{ menu_item_id: 4, quantity: 1 }],
      };

      await expect(customerModel.createOrder(newOrderPayload)).rejects.toThrow(
        "Cannot place order: The stall is currently closed."
      );
    });
  });

  //deleteOrder
  describe("customerModel.deleteOrder", () => {
    it("should cancel/delete order successfully if status is Pending", async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [
          {
            order_id: 1,
            user_id: 2,
            status: "Pending",
            order_item_no: null,
          },
        ],
      });
      mockRequest.query.mockResolvedValueOnce({ rowsAffected: [1] });
      mockRequest.query.mockResolvedValueOnce({
        recordset: [
          {
            order_id: 1,
            user_id: 2,
            status: "Cancelled",
            order_item_no: null,
          },
        ],
      });
      const result = await customerModel.deleteOrder(1);
      expect(result.status).toBe("Cancelled");
    });

    it("should throw an error if order status is not Pending", async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [
          {
            order_id: 1,
            user_id: 2,
            status: "Preparing",
            order_item_no: null,
          },
        ],
      });

      await expect(customerModel.deleteOrder(1)).rejects.toThrow(
        "Cannot cancel order. Current status is 'Preparing'."
      );
    });
  });

  //updateOrderItemQuantity
  describe("customerModel.updateOrderItemQuantity", () => {
    it("should update quantity successfully when status is Pending", async () => {
      //query 1: statusCheckQuery
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ status: "Pending", menu_item_id: 3 }],
      });
      //query 2: updateItemQuery
      mockRequest.query.mockResolvedValueOnce({ rowsAffected: [1] });
      //query 3: updateParentTotalQuery
      mockRequest.query.mockResolvedValueOnce({ rowsAffected: [1] });

      //query 4 onwards: getOrderById execution at the end
      mockRequest.query.mockResolvedValueOnce({
        recordset: [
          {
            order_id: 1,
            user_id: 2,
            status: "Pending",
            order_item_no: 2,
            quantity: 5,
            unit_price: 3.0,
            total_amount: 15.0,
            item_name: "Drink",
          },
        ],
      });
      const result = await customerModel.updateOrderItemQuantity(1, 2, 5);
      expect(result).toBeDefined();
      expect(result[0].order_items[0].quantity).toBe(5);
    });
    it("should throw an error if the item is not part of the order", async () => {
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });

      await expect(
        customerModel.updateOrderItemQuantity(1, 99, 5)
      ).rejects.toThrow("Item No 99 is not part of Order ID 1");
    });
  });
});