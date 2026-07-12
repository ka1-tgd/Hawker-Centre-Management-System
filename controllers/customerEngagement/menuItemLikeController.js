const menuItemLikeModel = require("../../models/customerEngagement/menuItemLikeModel.js");
 
// Create a new like (like a menu item)
async function createLike(req, res) {
  try {
    const { user_id, menu_item_id } = req.body;
 
    // Prevent the same customer liking the same item twice
    const existingLike = await menuItemLikeModel.findLike(user_id, menu_item_id);
    if (existingLike) {
      return res.status(400).json({ error: "You have already liked this item" });
    }
 
    const newLike = await menuItemLikeModel.createLike(req.body);
    res.status(201).json(newLike);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating like" });
  }
}
 
// Get all likes for a menu item
async function getLikesByMenuItem(req, res) {
  try {
    const menuItemId = parseInt(req.params.menuItemId);
    const likes = await menuItemLikeModel.getLikesByMenuItem(menuItemId);
    res.json({ menu_item_id: menuItemId, likeCount: likes.length, likes });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving likes" });
  }
}
 
// Get all items liked by a customer
async function getLikesByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const likedItems = await menuItemLikeModel.getLikesByUser(userId);
    res.json(likedItems);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving customer likes" });
  }
}
 
// Delete a like (unlike)
async function deleteLike(req, res) {
  try {
    const id = parseInt(req.params.id);
    const like = await menuItemLikeModel.getLikeById(id);
    if (!like) {
      return res.status(404).json({ error: "Like not found" });
    }
 
    await menuItemLikeModel.deleteLike(id);
    res.json({ message: "Like removed successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting like" });
  }
}
 
module.exports = {
  createLike,
  getLikesByMenuItem,
  getLikesByUser,
  deleteLike,
};