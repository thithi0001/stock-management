import {createExportReceiptWithDetails, getAllExportReceipts, getAllExportReceiptsById } from "../models/exportReceiptModel.js";


/**
 * (CẢI TIẾN)
 * Tạo phiếu xuất mới (bao gồm cả chi tiết sản phẩm) trong 1 lần
 */
export async function createExportReceiptController(req, res){
    try {
        // Lấy user_id từ middleware xác thực
        const created_by = req.user?.user_id ?? req.user?.id;
        // Lấy thông tin phiếu và danh sách sản phẩm từ body
        const { customer_id, total_amount, details } = req.body;

        if (!customer_id || !created_by) {
            return res.status(400).json({message: "Thiếu thông tin: customer_id hoặc không có người tạo (created_by)"}); 
        }

        // Kiểm tra xem chi tiết sản phẩm có hợp lệ không
        if (!Array.isArray(details) || details.length === 0) {
            return res.status(400).json({ message: "Thiếu thông tin chi tiết sản phẩm (details)" });
        }

        // Gọi hàm model mới (đã bao gồm transaction)
        const receipt = await createExportReceiptWithDetails({
            customer_id,
            created_by,
            total_amount: total_amount || 0,
            details // Truyền mảng chi tiết sản phẩm vào
        });

        return res.status(201).json({
            message: "Tạo phiếu xuất và chi tiết thành công",
            receipt,
        });
    } catch (error) {
        console.error("Lỗi khi tạo phiếu xuất:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

/**
 * (CẢI TIẾN)
 * Lấy danh sách tất cả phiếu xuất (hỗ trợ lọc theo trạng thái)
 */
export const getAllExportReceiptsController = async ( req, res) =>{
    try {
        // Lấy trạng thái từ query string (vd: /api/export?status=pending)
        const { status } = req.query;

        const receipts = await getAllExportReceipts(status); // Truyền status vào model
        return res.status(200).json(receipts);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách phiếu xuất:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Lấy chi tiết 1 phiếu xuất theo ID
export const getExportReceiptByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await getAllExportReceiptsById(Number(id));
    if (!receipt) return res.status(404).json({ message: "Không tìm thấy phiếu xuất" });
    return res.json({ data: receipt });
  } catch (error) {
    console.error("getExportReceiptByIdController error:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message ?? error });
  }
};