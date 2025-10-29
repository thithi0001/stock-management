import { createSupplier, deleteSupplier, getAllSuppliers, getSupplierById, updateSupplier } from "../models/supplierModel.js";

// Helper regex (copy từ schema SQL của bạn)
const phoneRegex = /^[0-9\\-\\+]{8,15}$/;
const emailRegex = /.+@.+/; // Đơn giản hoá từ "LIKE '%@%'"

/**
 * (MỚI)
 * Lấy danh sách nhà cung cấp (có phân trang và tìm kiếm)
 */
export const getSuppliers = async (req, res) => {
  try {
    // Lấy query params
    const { page = 1, limit = 10, q = '' } = req.query;
    
    const options = {
      page: Number(page),
      limit: Number(limit),
      q: q
    };

    const suppliers = await getAllSuppliers(options);
    // Trả về dữ liệu và thông tin phân trang (meta)
    res.json(suppliers); 
  } catch (err) {
    console.error("Lỗi khi lấy danh sách nhà cung cấp:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (MỚI)
 * Lấy chi tiết một nhà cung cấp
 */
export const getSupplierByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await getSupplierById(Number(id));
    if (!supplier) {
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    }
    res.json(supplier);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết nhà cung cấp:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (MỚI)
 * Tạo nhà cung cấp mới
 */
export const createSupplierController = async (req, res) => {
  try {
    const { supplier_name, address, phone, email } = req.body;

    // Validation cơ bản
    if (!supplier_name || !address || !phone || !email) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin: tên, địa chỉ, SĐT, email" });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Định dạng số điện thoại không hợp lệ" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Định dạng email không hợp lệ" });
    }

    const newSupplier = await createSupplier({ supplier_name, address, phone, email });
    res.status(201).json(newSupplier);
  } catch (err) {
    console.error("Lỗi khi tạo nhà cung cấp:", err);
    // Lỗi từ model (vd: trùng lặp)
    if (err.message.includes("đã tồn tại")) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (MỚI)
 * Cập nhật nhà cung cấp
 */
export const updateSupplierController = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, address, phone, email } = req.body;

    // Validation
    if (!supplier_name || !address || !phone || !email) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Định dạng số điện thoại không hợp lệ" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Định dạng email không hợp lệ" });
    }

    const updatedSupplier = await updateSupplier(Number(id), { supplier_name, address, phone, email });
    res.json(updatedSupplier);
  } catch (err) {
    console.error("Lỗi khi cập nhật nhà cung cấp:", err);
    if (err.message.includes("đã tồn tại")) {
      return res.status(409).json({ message: err.message });
    }
    // Lỗi không tìm thấy bản ghi để update
    if (err.code === 'P2025') {
       return res.status(404).json({ message: "Không tìm thấy nhà cung cấp để cập nhật" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (MỚI)
 * Xoá nhà cung cấp
 */
export const deleteSupplierController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSupplier(Number(id));
    res.status(200).json({ message: "Xoá nhà cung cấp thành công" });
  } catch (err) {
    console.error("Lỗi khi xoá nhà cung cấp:", err);
    // Lỗi ràng buộc khoá ngoại (nhà cung cấp đã có trong phiếu nhập)
    if (err.code === 'P2003') {
      return res.status(409).json({ message: "Không thể xoá nhà cung cấp này vì đã có phiếu nhập liên quan" });
    }
    // Lỗi không tìm thấy
    if (err.code === 'P2025') {
       return res.status(404).json({ message: "Không tìm thấy nhà cung cấp để xoá" });
    }
    res.status(500).json({ message: "Server error" });
  }
};