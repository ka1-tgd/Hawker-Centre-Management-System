const feedbackModel = require("../../models/customerEngagement/feedbackModel.js");

// Get a customer's past orders eligible for feedback (for the dropdown)
async function getEligibleOrders(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const orders = await feedbackModel.getEligibleOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving eligible orders" });
  }
}

// Create new feedback
async function createFeedback(req, res) {
  try {
    const newFeedback = await feedbackModel.createFeedback(req.body);
    res.status(201).json({
      ...newFeedback,
      pointsEarned: feedbackModel.FEEDBACK_POINTS,
    });
  } catch (error) {
    console.error("Controller error:", error);
    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error creating feedback" });
  }
}

// Get all feedback submitted by a customer
async function getFeedbackByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const feedback = await feedbackModel.getFeedbackByUser(userId);
    res.json(feedback);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving feedback" });
  }
}

// Update feedback
async function updateFeedback(req, res) {
  try {
    const id = parseInt(req.params.id);
    const existing = await feedbackModel.getFeedbackById(id);
    if (!existing) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    const updatedFeedback = await feedbackModel.updateFeedback(id, req.body);
    res.json(updatedFeedback);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating feedback" });
  }
}

// Delete feedback
async function deleteFeedback(req, res) {
  try {
    const id = parseInt(req.params.id);
    const existing = await feedbackModel.getFeedbackById(id);
    if (!existing) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    await feedbackModel.deleteFeedback(id, existing.user_id);
    res.json({ message: "Feedback deleted successfully. Points deducted." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting feedback" });
  }
}

module.exports = {
  getEligibleOrders,
  createFeedback,
  getFeedbackByUser,
  updateFeedback,
  deleteFeedback,
};