import express from "express";
import {createExportReceiptController, getAllExportReceiptsController, getExportReceiptByIdController } from "../controllers/exportReceiptController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { ROLES } from "../models/role.js";


const router = express.Router();


// POST /
// (CẢI TIẾN) Tạo phiếu xuất mới (bao gồm cả chi tiết)
router.post("/", authenticateToken, authorizeRoles(ROLES.EXPORTSTAFF, ROLES.STOREKEEPER), createExportReceiptController);


// GET /
// (CẢI TIẾN) Lấy tất cả phiếu xuất (hỗ trợ lọc ?status=...)
router.get("/", getAllExportReceiptsController);

// Lấy chi tiết 1 phiếu xuất
router.get("/:id", getExportReceiptByIdController);

export default router;