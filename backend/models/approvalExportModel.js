import { prisma } from "../config/db.js";

export const getExportReceiptsByStatus = async (status) => {
  const validStatus = ["all", "pending", "approved", "rejected"];
  if (!validStatus.includes(status)) {
    throw new Error("Trạng thái không hợp lệ (all / pending / approved / rejected)");
  }

  // Xây dựng điều kiện WHERE
  const whereClause = {};
  if (status !== "all") {
    whereClause.receipt_status = status;
  }

  // Luôn truy vấn từ bảng export_receipts làm bảng gốc
  const receipts = await prisma.export_receipts.findMany({
    where: whereClause,
    orderBy: { created_at: "desc" },
    include: {
      // Thông tin khách hàng
      customers: {
        select: {
          customer_id: true,
          customer_name: true,
          phone: true,
        },
      },
      // Thông tin người tạo phiếu
      user_accounts: {
        select: {
          user_id: true,
          username: true,
          full_name: true,
        },
      },
      // Thông tin người duyệt (nếu có)
      approval_exports: {
        select: {
          approval_id: true,
          approved_at: true,
          reason: true,
          new_status: true,
          // Lấy thông tin người duyệt
          user_accounts: {
            select: {
              user_id: true,
              full_name: true,
            },
          },
        },
      },
    },
  });

  // Ánh xạ lại để làm phẳng dữ liệu người duyệt
  return receipts.map((r) => ({
    receipt_id: r.receipt_id,
    created_at: r.created_at,
    receipt_status: r.receipt_status,
    total_amount: r.total_amount,
    customer: r.customers, // object
    created_by: r.user_accounts, // object
    // Lấy bản ghi duyệt đầu tiên (thường chỉ có 1)
    approval_info: r.approval_exports.length > 0 ? {
        ...r.approval_exports[0],
        // Làm phẳng tên người duyệt
        approved_by_name: r.approval_exports[0]?.user_accounts?.full_name,
    } : null,
  }));
};

export const findExportReceiptById = async (receiptId) => {
  const receipt = await prisma.export_receipts.findUnique({
    where: { receipt_id: receiptId },
    include: {
      customers: {
        select: {
          customer_name: true,
          address: true,
          phone: true,
          email: true,
        },
      },
      user_accounts: { // Người tạo
        select: {
          full_name: true,
          email: true,
        },
      },
      approval_exports: { // Người duyệt
        include: {
          user_accounts: {
            select: {
              full_name: true,
            },
          },
        },
      },
      // Quan trọng nhất: Lấy chi tiết các sản phẩm
      export_details: {
        include: {
          products: {
            select: {
              product_name: true,
              unit: true,
            },
          },
        },
      },
    },
  });

  if (!receipt) {
    throw new Error(`Không tìm thấy phiếu xuất với ID #${receiptId}`);
  }

  // Xử lý làm phẳng dữ liệu chi tiết
  const approval = receipt.approval_exports.length > 0 ? receipt.approval_exports[0] : null;

  return {
    receipt_id: receipt.receipt_id,
    created_at: receipt.created_at,
    receipt_status: receipt.receipt_status,
    total_amount: receipt.total_amount,
    customer: receipt.customers,
    created_by: receipt.user_accounts,
    approval_info: approval ? {
      approved_at: approval.approved_at,
      new_status: approval.new_status,
      reason: approval.reason,
      approved_by_name: approval.user_accounts?.full_name,
    } : null,
    // Trả về danh sách sản phẩm đã được join
    details: receipt.export_details.map(d => ({
        product_id: d.product_id,
        product_name: d.products.product_name,
        unit: d.products.unit,
        quantity: d.quantity,
        unit_price: d.unit_price,
        total_amount: d.total_amount
    }))
  };
};

export async function approveExport(data) {
    const { export_receipt_id, approved_by, new_status, reason } = data;

    return await prisma.$transaction(async(tx) =>{
        const approval = await tx.approval_exports.create({
            data:{
                export_receipt_id,
                approved_by,
                new_status,
                reason,
            },
        });

        await tx.export_receipts.update({
            where:{receipt_id: export_receipt_id},
            data: {receipt_status: new_status},
        });

        if(new_status === "approved"){
            const details = await tx.export_details.findMany({
                where: {receipt_id: export_receipt_id},
            });

            for(const d of details){
                const stock = await tx.stocks.findFirst({
                    where:{product_id: d.product_id},
                });

                if(!stock){
                    throw new Error(`Không tìm thấy tồn kho cho sản phẩm ID ${d.product_id}`);
                }

                const product = await tx.products.findUnique({where: {product_id: d.product_id}});


                if(stock.quantity < d.quantity){
                    throw new Error( `Sản phẩm "${product.product_name}" (ID ${d.product_id}) không đủ hàng để xuất`)
                }
                const newQuantity = stock.quantity - d.quantity;

                await tx.stocks.update({
                    where:{stock_id: stock.stock_id},
                    data:{
                        quantity: newQuantity,
                        warning: newQuantity < product.minimum ? true : false,
                        last_updated_at: new Date(),
                    },
                });
            }
        }
        return {
            message: `Phiếu xuất #${export_receipt_id} đã được ${new_status === "approved" ? "duyệt" : "từ chối"}`,
            approval,
        };
    });
}