const express = require("express");
const router  = express.Router();

const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getSummary
} = require("../controllers/recordController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// NOTE: /summary must be registered before /:id — Express would otherwise
// treat the literal string "summary" as an ObjectId parameter.
router.get("/summary", protect, authorizeRoles("admin", "analyst"), getSummary);

// Admin only — write operations
router.post("/",      protect, authorizeRoles("admin"), createRecord);
router.put("/:id",    protect, authorizeRoles("admin"), updateRecord);
router.delete("/:id", protect, authorizeRoles("admin"), deleteRecord);

// Admin + Analyst — read operations
// viewer is intentionally excluded from all record routes;
// they may only access /api/dashboard/stats
router.get("/",    protect, authorizeRoles("admin", "analyst"), getRecords);
router.get("/:id", protect, authorizeRoles("admin", "analyst"), getRecordById);

module.exports = router;
