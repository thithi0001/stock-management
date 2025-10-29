import { createCustomer, deleteCustomer, getAllCustomer, getCustomerById, updateCustomer } from "../models/customerModel.js";

// Helper regex (copy từ schema SQL của bạn)
const phoneRegex = /^[0-9\\-\\+]{8,15}$/;
const emailRegex = /.+@.+/; // Đơn giản hoá từ "LIKE '%@%'"

/**
 * (CẢI TIẾN)
 * Lấy danh sách khách hàng (có phân trang và tìm kiếm)
 */
export const getCustomers = async (req, res) => {
  try {
    // Lấy query params
    const { page = 1, limit = 10, q = '' } = req.query;
    
    const options = {
      page: Number(page),
      limit: Number(limit),
      q: q
    };

    const customers = await getAllCustomer(options);
    // Trả về dữ liệu và thông tin phân trang (meta)
    res.json(customers); 
  } catch (err) {
    console.error("Lỗi khi lấy danh sách khách hàng:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (MỚI)
 * Lấy chi tiết một khách hàng
 */
export const getCustomerByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await getCustomerById(Number(id));
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.json(customer);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết khách hàng:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (MỚI)
 * Tạo khách hàng mới
 */
export const createCustomerController = async (req, res) => {
  try {
    const { customer_name, address, phone, email } = req.body;

    // Validation cơ bản
    if (!customer_name || !address || !phone || !email) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin: tên, địa chỉ, SĐT, email" });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Định dạng số điện thoại không hợp lệ" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Định dạng email không hợp lệ" });
    }

    const newCustomer = await createCustomer({ customer_name, address, phone, email });
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("Lỗi khi tạo khách hàng:", err);
    // Lỗi từ model (vd: trùng lặp)
    if (err.message.includes("đã tồn tại")) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (MỚI)
 * Cập nhật khách hàng
 */
export const updateCustomerController = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, address, phone, email } = req.body;

    // Validation
    if (!customer_name || !address || !phone || !email) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Định dạng số điện thoại không hợp lệ" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Định dạng email không hợp lệ" });
    }

    const updatedCustomer = await updateCustomer(Number(id), { customer_name, address, phone, email });
    res.json(updatedCustomer);
  } catch (err) {
    console.error("Lỗi khi cập nhật khách hàng:", err);
    if (err.message.includes("đã tồn tại")) {
      return res.status(409).json({ message: err.message });
    }
    // Lỗi không tìm thấy bản ghi để update
    if (err.code === 'P2025') {
       return res.status(404).json({ message: "Không tìm thấy khách hàng để cập nhật" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (MỚI)
 * Xoá khách hàng
 */
export const deleteCustomerController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCustomer(Number(id));
    res.status(200).json({ message: "Xoá khách hàng thành công" });
  } catch (err) {
    console.error("Lỗi khi xoá khách hàng:", err);
    // Lỗi ràng buộc khoá ngoại (khách hàng đã có trong phiếu xuất)
    if (err.code === 'P2003') {
      return res.status(409).json({ message: "Không thể xoá khách hàng này vì đã có phiếu xuất liên quan" });
    }
    // Lỗi không tìm thấy
    if (err.code === 'P2025') {
       return res.status(404).json({ message: "Không tìm thấy khách hàng để xoá" });
    }
    res.status(500).json({ message: "Server error" });
  }
};