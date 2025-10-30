import express from "express";
import {
  approveImportController,
  getImportApprovalsByStatusController,
} from "../controllers/approvalImportController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { ROLES } from "../models/role.js";

const router = express.Router();

// GET /api/approval-import/status/:status (vd: /pending, /approved)
// Lấy danh sách phiếu nhập cho thủ kho
router.get("/status/:status", getImportApprovalsByStatusController);

// POST /api/approval-import/:id (vd: /123)
// Xử lý duyệt hoặc từ chối
router.post("/:id", authenticateToken, authorizeRoles(ROLES.STOREKEEPER) ,approveImportController);

export default router;