import express from "express";
import { createCustomerController, deleteCustomerController, getCustomerByIdController, getCustomers, updateCustomerController } from "../controllers/customerController.js";
const router = express.Router();

// GET /api/customers?page=1&limit=10&q=search_term
// (CẢI TIẾN) Lấy danh sách + phân trang + tìm kiếm
router.get("/", getCustomers);

// POST /api/customers
// (MỚI) Thêm khách hàng
router.post("/", createCustomerController);

// GET /api/customers/:id
// (MỚI) Lấy chi tiết 1 khách hàng
router.get("/:id", getCustomerByIdController);

// PUT /api/customers/:id
// (MỚI) Cập nhật 1 khách hàng
router.put("/:id", updateCustomerController);

// DELETE /api/customers/:id
// (MỚI) Xoá 1 khách hàng
router.delete("/:id", deleteCustomerController);
export default router;