import {
  approveImportReceipt,
  getImportApprovalsByStatus,
} from "../models/approvalImportModel.js";

/**
 * (MỚI)
 * Lấy danh sách phiếu nhập (cho Thủ kho) theo trạng thái
 */
export const getImportApprovalsByStatusController = async (req, res) => {
  try {
    const { status } = req.params;
    const data = await getImportApprovalsByStatus(status);
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Lỗi khi lọc danh sách duyệt phiếu nhập:", error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

/**
 * (MỚI)
 * Thủ kho duyệt hoặc từ chối phiếu nhập
 */
export const approveImportController = async (req, res) => {
  try {
    const { id } = req.params; // Lấy import_receipt_id từ URL
    const { new_status, reason } = req.body;

    // Lấy ID của Thủ kho từ token (đã đăng nhập)
    const approved_by = req.user?.user_id ?? req.user?.id;

    if (!approved_by) {
      return res.status(401).json({ message: "Không xác định được người duyệt. Yêu cầu đăng nhập." });
    }

    if (!new_status || !["approved", "rejected"].includes(new_status)) {
      return res.status(400).json({ message: "new_status phải là 'approved' hoặc 'rejected'" });
    }

    if (new_status === "rejected" && !reason) {
      return res.status(400).json({ message: "Bắt buộc phải có lý do (reason) khi từ chối" });
    }

    const result = await approveImportReceipt({
      import_receipt_id: Number(id),
      approved_by: Number(approved_by),
      new_status,
      reason,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi duyệt phiếu nhập:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};