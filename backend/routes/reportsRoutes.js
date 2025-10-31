import express from "express";
import {
  getImportReport,
  getExportReport,
  getInventoryReport,
} from "../controllers/reportsController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { ROLES } from "../models/role.js";

const router = express.Router();

// Chỉ Manager và Thủ kho mới được xem báo cáo
// router.use(authenticateToken, authorizeRoles(ROLES.MANAGER, ROLES.STOREKEEPER));

// GET /api/reports/import?month=10&year=2025
router.get("/import", getImportReport);

// GET /api/reports/export?month=10&year=2025
router.get("/export", getExportReport);

// GET /api/reports/inventory
router.get("/inventory", getInventoryReport);

export default router;