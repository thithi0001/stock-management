import express from "express";
import { createSupplierController, deleteSupplierController, getSupplierByIdController, getSuppliers, updateSupplierController } from "../controllers/supplierController.js";

const router = express.Router();

// GET /api/suppliers?page=1&limit=10&q=search_term
// (MỚI) Lấy danh sách + phân trang + tìm kiếm
router.get("/", getSuppliers);

// POST /api/suppliers
// (MỚI) Thêm nhà cung cấp
router.post("/", createSupplierController);

// GET /api/suppliers/:id
// (MỚI) Lấy chi tiết 1 nhà cung cấp
router.get("/:id", getSupplierByIdController);

// PUT /api/suppliers/:id
// (MỚI) Cập nhật 1 nhà cung cấp
router.put("/:id", updateSupplierController);

// DELETE /api/suppliers/:id
// (MỚI) Xoá 1 nhà cung cấp
router.delete("/:id", deleteSupplierController);

export default router;