const menuItemLikeController = require("../controllers/customerEngagement/menuItemLikeController.js");
const menuItemLikeModel = require("../models/customerEngagement/menuItemLikeModel.js");

jest.mock("../models/customerEngagement/menuItemLikeModel.js");

describe("menuItemLikeController.createLike", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if the customer already liked this item", async () => {
    menuItemLikeModel.findLike.mockResolvedValue({ LikeID: 5 });
    const req = { body: { user_id: 1, menu_item_id: 10 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await menuItemLikeController.createLike(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "You have already liked this item" });
    expect(menuItemLikeModel.createLike).not.toHaveBeenCalled();
  });

  it("creates the like when no existing like is found", async () => {
    menuItemLikeModel.findLike.mockResolvedValue(null);
    menuItemLikeModel.createLike.mockResolvedValue({ LikeID: 8, user_id: 1, menu_item_id: 10 });
    const req = { body: { user_id: 1, menu_item_id: 10 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await menuItemLikeController.createLike(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ LikeID: 8, user_id: 1, menu_item_id: 10 });
  });
});

describe("menuItemLikeController.deleteLike", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 if the like does not exist", async () => {
    menuItemLikeModel.getLikeById.mockResolvedValue(null);
    const req = { params: { id: "99" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await menuItemLikeController.deleteLike(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Like not found" });
    expect(menuItemLikeModel.deleteLike).not.toHaveBeenCalled();
  });

  it("removes the like when it exists", async () => {
    menuItemLikeModel.getLikeById.mockResolvedValue({ LikeID: 8 });
    menuItemLikeModel.deleteLike.mockResolvedValue(true);
    const req = { params: { id: "8" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await menuItemLikeController.deleteLike(req, res);

    expect(menuItemLikeModel.deleteLike).toHaveBeenCalledWith(8);
    expect(res.json).toHaveBeenCalledWith({ message: "Like removed successfully" });
  });
});