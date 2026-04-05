const express = require("express");
const router  = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getCategorySummary,
  getRecent,
  getMonthlyTrends,
  getWeeklyTrends
} = require("../controllers/dashboardController");

// viewer gets stats only — no record-level data
router.get("/stats",      protect, authorizeRoles("admin", "analyst", "viewer"), getDashboardStats);

// analyst + admin get full dashboard
router.get("/categories", protect, authorizeRoles("admin", "analyst"), getCategorySummary);
router.get("/recent",     protect, authorizeRoles("admin", "analyst"), getRecent);
router.get("/trends/monthly", protect, authorizeRoles("admin", "analyst"), getMonthlyTrends);
router.get("/trends/weekly",  protect, authorizeRoles("admin", "analyst"), getWeeklyTrends);

module.exports = router;
