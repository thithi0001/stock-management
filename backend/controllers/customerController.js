import { getAllCustomer } from "../models/customerModel.js";

export const getCustomers = async (req, res) => {
  try {
    const customers = await getAllCustomer();
    res.json(customers);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách khách hàng:", err);
    res.status(500).json({ message: "Server error" });
  }
};