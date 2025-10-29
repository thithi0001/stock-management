import { prisma } from "../config/db.js";

export async function getAllExportReceiptsById(receipt_id){
    return await prisma.export_receipts.findUnique({
        where:{receipt_id},
        include:{
            customers: true,
            user_accounts: true,
            export_details:{
                include: {products: true}
            }
        }
    });
}

/**
 * (CẢI TIẾN)
 * Tạo phiếu xuất và chi tiết phiếu xuất trong 1 giao dịch (transaction)
 */
export async function createExportReceiptWithDetails(data){
    const { customer_id, created_by, total_amount, details } = data;

    // Sử dụng $transaction để đảm bảo tất cả hoặc không có gì được tạo
    return await prisma.$transaction(async (tx) => {
        // 1. Tạo phiếu xuất (phần header)
        const receipt = await tx.export_receipts.create({
            data: {
                customer_id,
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

        // 3. Thêm tất cả chi tiết sản phẩm bằng `createMany` (nhanh và an toàn)
        await tx.export_details.createMany({
            data: preparedDetails
        });

        // Trả về phiếu xuất đã được tạo
        return receipt;
    });
}

/**
 * (BỔ SUNG VÀ CẢI TIẾN)
 * Lấy tất cả phiếu xuất, có thể lọc theo trạng thái
 * Đáp ứng yêu cầu "hiển thị danh sách" và "lọc theo trạng thái"
 */
export async function getAllExportReceipts(status){
    
    // Xây dựng mệnh đề 'where'
    const whereClause = {};
    if(status && status !== 'all'){
        whereClause.receipt_status = status;
    }

    return await prisma.export_receipts.findMany({
        where: whereClause, // Áp dụng điều kiện lọc
        include:{
            customers: { // Chỉ lấy thông tin cần thiết cho danh sách
                select: { customer_name: true }
            },
            user_accounts: { // Chỉ lấy tên người tạo
                select: { full_name: true }
            }
        },
        orderBy: {created_at: 'desc'}
    });
}