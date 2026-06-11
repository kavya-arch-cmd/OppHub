const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
    getOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
} = require("../controllers/opportunityController");

// GET all opportunities
router.get("/", getOpportunities);

// GET single opportunity
router.get("/:id", getOpportunityById);

// POST create opportunity (Admin only)
router.post("/", protect, adminOnly, createOpportunity);

// PUT update opportunity (Admin only)
router.put("/:id", protect, adminOnly, updateOpportunity);

// DELETE opportunity (Admin only)
router.delete("/:id", protect, adminOnly, deleteOpportunity);

module.exports = router;