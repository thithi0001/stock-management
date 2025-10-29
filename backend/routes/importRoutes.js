import express from "express";
import { ROLES } from "../models/role.js";
import { createImportReceiptController, getAllImportReceiptsController, getImportReceiptByIdController } from "../controllers/importReceiptController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/import
// Tạo phiếu nhập mới (bao gồm cả chi tiết)
router.post("/", authenticateToken, authorizeRoles(ROLES.IMPORTSTAFF, ROLES.STOREKEEPER), createImportReceiptController);

// GET /api/import
// Lấy tất cả phiếu nhập (hỗ trợ lọc ?status=...)
router.get("/", getAllImportReceiptsController);

// GET /api/import/:id
// Lấy chi tiết 1 phiếu nhập
router.get("/:id", getImportReceiptByIdController);

export default router;