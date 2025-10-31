import {
  call_sp_report_import_by_month,
  call_sp_report_export_by_month,
  call_sp_report_inventory_snapshot,
} from "../models/reportsModel.js";

// Lấy báo cáo Nhập
export const getImportReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Vui lòng cung cấp tháng (month) và năm (year)" });
    }
    const data = await call_sp_report_import_by_month(Number(month), Number(year));
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo nhập:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy báo cáo Xuất
export const getExportReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Vui lòng cung cấp tháng (month) và năm (year)" });
    }
    const data = await call_sp_report_export_by_month(Number(month), Number(year));
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo xuất:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy báo cáo Tồn kho (hiện tại)
export const getInventoryReport = async (req, res) => {
  try {
    const data = await call_sp_report_inventory_snapshot();
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo tồn kho:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};