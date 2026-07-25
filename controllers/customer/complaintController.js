const complaintModel = require("../../models/customer/complaintModel");

// Create a new complaint
async function createComplaint(req, res) {
  try {
    const newComplaint = await complaintModel.createComplaint(req.body);
    res.status(201).json(newComplaint);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating complaint" });
  }
}

// Get all complaints for a customer
async function getComplaintsByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const complaints = await complaintModel.getComplaintsByUser(userId);
    res.json(complaints);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving complaints" });
  }
}

// Update complaint status
async function updateComplaintStatus(req, res) {
  try {
    const complaintId = parseInt(req.params.id);
    const { status } = req.body;

    const updated = await complaintModel.updateComplaintStatus(complaintId, status);

    if (!updated) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({ message: "Complaint status updated successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating complaint status" });
  }
}

// Delete a complaint (only if still Pending)
async function deleteComplaint(req, res) {
  try {
    const complaintId = parseInt(req.params.id);
    const userId = req.user.id;

    const deleted = await complaintModel.deleteComplaint(complaintId, userId);

    if (!deleted) {
      return res.status(404).json({ error: "Complaint not found, not owned by you, or already being processed" });
    }

    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting complaint" });
  }
}

module.exports = {
  createComplaint,
  getComplaintsByUser,
  updateComplaintStatus,
  deleteComplaint,
};