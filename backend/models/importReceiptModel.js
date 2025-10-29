import { prisma } from "../config/db.js";

/**
 * (MỚI)
 * Tạo phiếu nhập và chi tiết phiếu nhập trong 1 giao dịch (transaction)
 */
export async function createImportReceiptWithDetails(data) {
  const { supplier_id, created_by, total_amount, details } = data;

  // Sử dụng $transaction để đảm bảo tất cả hoặc không có gì được tạo
  return await prisma.$transaction(async (tx) => {
    // 1. Tạo phiếu nhập (phần header)
    const receipt = await tx.import_receipts.create({
      data: {
        supplier_id,
        created_by,
        total_amount,
        receipt_status: "pending" // Mặc định là 'chờ duyệt'
      }
    });

    const receipt_id = receipt.receipt_id;

    // 2. Chuẩn bị dữ liệu chi tiết (thêm receipt_id vào từng sản phẩm)
    const preparedDetails = details.map(d => ({
      ...d, // Gồm: product_id, quantity, unit_price, total_amount
      receipt_id: receipt_id
    }));

    // 3. Thêm tất cả chi tiết sản phẩm bằng `createMany`
    await tx.import_details.createMany({
      data: preparedDetails
    });

    return receipt;
  });
}

/**
 * (MỚI)
 * Lấy tất cả phiếu nhập, có thể lọc theo trạng thái
 */
export async function getAllImportReceipts(status) {
  
  const whereClause = {};
  if (status && status !== 'all') {
    whereClause.receipt_status = status;
  }

  return await prisma.import_receipts.findMany({
    where: whereClause,
    include: {
      suppliers: { // Thông tin nhà cung cấp
        select: { supplier_name: true }
      },
      user_accounts: { // Thông tin người tạo
        select: { full_name: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

/**
 * (MỚI)
 * Lấy chi tiết 1 phiếu nhập theo ID (bao gồm sản phẩm và người duyệt)
 */
export async function getImportReceiptById(id) {
  return await prisma.import_receipts.findUnique({
    where: { receipt_id: id },
    include: {
      suppliers: true,
      user_accounts: true, // Người tạo phiếu
      import_details: { // Danh sách sản phẩm
        include: { products: true }
      },
      approval_imports: { // Thông tin duyệt (nếu có)
        include: {
          user_accounts: true // Người duyệt
        }
      }
    }
  });
}