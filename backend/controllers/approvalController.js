import { approveExport, findExportReceiptById, getExportReceiptsByStatus } from "../models/approvalExportModel.js"

export const getAllExportReceipts = async (req, res) => {
  try {
    // Mặc định lấy tất cả
    const data = await getExportReceiptsByStatus("all"); 
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Lỗi khi lấy tất cả phiếu xuất:", error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// Lọc theo trạng thái
export const getExportReceiptsByStatusController = async (req, res) => {
  try {
    const { status } = req.params;
    const data = await getExportReceiptsByStatus(status);
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Lỗi khi lọc danh sách duyệt phiếu:", error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

/**
 * (MỚI)
 * Lấy chi tiết 1 phiếu xuất
 */
export const getExportReceiptDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await findExportReceiptById(Number(id));
        return res.status(200).json(data);
    } catch (error) {
        console.error("❌ Lỗi khi lấy chi tiết phiếu xuất:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

/**
 * (CẬP NHẬT)
 * Duyệt hoặc từ chối phiếu
 */
export const approveExportController = async (req, res) => {
  try {
    // Đổi tên param cho nhất quán
    const { id } = req.params; 
    const { new_status, reason } = req.body;

    // Lấy ID người duyệt từ token (đã xác thực)
    const approved_by = req.user?.user_id ?? req.user?.id;
    
    if (!approved_by) {
        return res.status(401).json({ message: "Không xác định được người duyệt. Yêu cầu đăng nhập." });
    }

    if (!new_status || !["approved", "rejected"].includes(new_status)) {
      return res.status(400).json({ message: "new_status phải là 'approved' hoặc 'rejected'" });
    }

    const result = await approveExport({
      export_receipt_id: Number(id), // Dùng ID từ param
      approved_by: Number(approved_by),
      new_status,
      reason: reason ?? "Không có ghi chú",
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi duyệt phiếu xuất:", error);
    // Phân tách lỗi do nghiệp vụ (vd: hết hàng) và lỗi server
    if (error.message.includes("không đủ hàng") || error.message.includes("Không tìm thấy")) {
        return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};