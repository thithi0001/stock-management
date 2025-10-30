import { prisma } from "../config/db.js";

/**
 * (MỚI)
 * Xử lý nghiệp vụ Duyệt hoặc Từ chối Phiếu Nhập Hàng.
 * Tự động cập nhật tồn kho nếu "approved".
 */
export async function approveImportReceipt(data) {
  const { import_receipt_id, approved_by, new_status, reason } = data;

  // Sử dụng transaction để đảm bảo tính toàn vẹn
  return await prisma.$transaction(async (tx) => {
    
    // 1. Ghi lại log vào bảng approval_imports
    const approval = await tx.approval_imports.create({
      data: {
        import_receipt_id: Number(import_receipt_id),
        approved_by: Number(approved_by),
        new_status,
        reason: reason ?? (new_status === 'approved' ? 'Đã duyệt' : 'Bị từ chối'),
      },
    });

    // 2. Cập nhật trạng thái của phiếu nhập
    await tx.import_receipts.update({
      where: { receipt_id: Number(import_receipt_id) },
      data: { receipt_status: new_status },
    });

    // 3. (QUAN TRỌNG) Nếu duyệt 'approved', gọi SP để cộng hàng vào kho
    if (new_status === "approved") {
      // Gọi Stored Procedure sp_increase_stock
      await tx.$executeRaw`CALL sp_increase_stock(${import_receipt_id})`;
    }

    // 4. Trả về kết quả
    return {
      message: `Phiếu nhập #${import_receipt_id} đã được ${
        new_status === "approved" ? "duyệt (và cập nhật kho)" : "từ chối"
      }`,
      approval,
    };
  });
}

/**
 * (MỚI)
 * Lấy danh sách phiếu nhập theo trạng thái (cho trang duyệt của thủ kho)
 * Gần giống với hàm getApprovalsByStatus của 'Xuất hàng'
 */
export const getImportApprovalsByStatus = async (status) => {
  if (status === "all" || status === "pending") {
    const where =
      status === "pending"
        ? { receipt_status: "pending" } // Chỉ lấy phiếu chờ duyệt
        : {}; // Lấy tất cả

    // Lấy từ bảng gốc import_receipts
    return await prisma.import_receipts.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        suppliers: {
          select: {
            supplier_id: true,
            supplier_name: true,
          },
        },
        user_accounts: { // Người tạo (NV Mua hàng)
          select: {
            user_id: true,
            full_name: true,
          },
        },
      },
    });
  }

  if (["approved", "rejected"].includes(status)) {
    // Lấy từ bảng approval_imports
    const approvals = await prisma.approval_imports.findMany({
      where: { new_status: status },
      orderBy: { approved_at: "desc" },
      include: {
        import_receipts: {
          include: {
            suppliers: {
              select: {
                supplier_id: true,
                supplier_name: true,
              },
            },
            user_accounts: { // Người tạo (NV Mua hàng)
              select: {
                user_id: true,
                full_name: true,
              },
            },
          },
        },
        user_accounts: { // Người duyệt (Thủ kho)
          select: {
            user_id: true,
            full_name: true,
          },
        },
      },
    });

    // Chuẩn hóa dữ liệu trả về cho frontend
    return approvals.map((a) => ({
      approval_id: a.approval_id,
      import_receipt_id: a.import_receipt_id,
      approved_at: a.approved_at,
      new_status: a.new_status,
      reason: a.reason,
      approved_by_name: a.user_accounts?.full_name,
      supplier_name: a.import_receipts?.suppliers?.supplier_name,
      requested_by_name: a.import_receipts?.user_accounts?.full_name,
      total_amount: a.import_receipts?.total_amount,
    }));
  }

  throw new Error("Trạng thái không hợp lệ (all / pending / approved / rejected)");
};