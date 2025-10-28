import express from "express";
import { approveExportController, getAllExportReceipts, getExportReceiptDetails, getExportReceiptsByStatusController} from "../controllers/approvalController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { ROLES } from "../models/role.js";

const router = express.Router();

// GET / -> Lấy tất cả phiếu xuất
router.get('/', getAllExportReceipts);
// GET /status/:status -> Lọc theo trạng thái
router.get('/status/:status', getExportReceiptsByStatusController);
// GET /:id -> (MỚI) Lấy chi tiết 1 phiếu xuất
router.get('/:id', getExportReceiptDetails);
router.post('/:id', authenticateToken, authorizeRoles(ROLES.STOREKEEPER),approveExportController);

export default router;