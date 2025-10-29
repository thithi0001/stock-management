import {
  createImportReceiptWithDetails,
  getAllImportReceipts,
  getImportReceiptById
} from "../models/importReceiptModel.js";

/**
 * (MỚI)
 * Tạo phiếu nhập mới (bao gồm cả chi tiết sản phẩm)
 */
export async function createImportReceiptController(req, res) {
  try {
    // Lấy user_id từ middleware xác thực
    const created_by = req.user?.user_id ?? req.user?.id;
    // Lấy thông tin phiếu và danh sách sản phẩm từ body
    const { supplier_id, total_amount, details } = req.body;

    if (!supplier_id || !created_by) {
      return res.status(400).json({ message: "Thiếu thông tin: supplier_id hoặc không có người tạo (created_by)" });
    }

    if (!Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin chi tiết sản phẩm (details)" });
    }

    // Gọi hàm model (đã bao gồm transaction)
    const receipt = await createImportReceiptWithDetails({
      supplier_id,
      created_by,
      total_amount: total_amount || 0,
      details // Truyền mảng chi tiết sản phẩm vào
    });

    return res.status(201).json({
      message: "Tạo phiếu nhập và chi tiết thành công",
      receipt,
    });
  } catch (error) {
    console.error("Lỗi khi tạo phiếu nhập:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * (MỚI)
 * Lấy danh sách tất cả phiếu nhập (hỗ trợ lọc theo trạng thái)
 */
export const getAllImportReceiptsController = async (req, res) => {
  try {
    // Lấy trạng thái từ query string (vd: /api/import?status=pending)
    const { status } = req.query;

    const receipts = await getAllImportReceipts(status);
    return res.status(200).json(receipts);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phiếu nhập:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * (MỚI)
 * Lấy chi tiết 1 phiếu nhập theo ID
 */
export const getImportReceiptByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await getImportReceiptById(Number(id));
    if (!receipt) return res.status(404).json({ message: "Không tìm thấy phiếu nhập" });
    
    return res.json(receipt);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phiếu nhập:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message ?? error });
  }
};