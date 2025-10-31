import { prisma } from "../config/db.js";

export async function call_sp_report_import_by_month(month, year) {
  // 1. Lấy dữ liệu thô (ví dụ: [{ f0: 1, f1: 'Bút bi', ... }])
  const rawData = await prisma.$queryRaw`CALL sp_report_import_by_month(${month}, ${year})`;

  // 2. (MỚI) Remap lại keys và chuyển đổi kiểu dữ liệu
  if (Array.isArray(rawData)) {
    return rawData.map(row => ({
      product_id: Number(row.f0),
      product_name: row.f1,
      unit: row.f2,
      total_quantity_imported: Number(row.f3), // Chuyển sang Number
      total_value_imported: Number(row.f4)     // Chuyển sang Number
    }));
  }
  return []; // Trả về mảng rỗng nếu không có dữ liệu
}

export async function call_sp_report_export_by_month(month, year) {
  // 1. Lấy dữ liệu thô
  const rawData = await prisma.$queryRaw`CALL sp_report_export_by_month(${month}, ${year})`;

  // 2. (MỚI) Remap lại keys và chuyển đổi kiểu dữ liệu
  if (Array.isArray(rawData)) {
    return rawData.map(row => ({
      product_id: Number(row.f0),
      product_name: row.f1,
      unit: row.f2,
      total_quantity_exported: Number(row.f3), // Chuyển sang Number
      total_value_exported: Number(row.f4)     // Chuyển sang Number
    }));
  }
  return [];
}

export async function call_sp_report_inventory_snapshot() {
  // 1. Lấy dữ liệu thô
  const rawData = await prisma.$queryRaw`CALL sp_report_inventory_snapshot()`;

  // 2. (MỚI) Remap lại keys và chuyển đổi kiểu dữ liệu
  if (Array.isArray(rawData)) {
    return rawData.map(row => ({
      product_id: Number(row.f0),
      product_name: row.f1,
      unit: row.f2,
      current_stock: Number(row.f3),   // Chuyển sang Number
      minimum_level: Number(row.f4),   // Chuyển sang Number
      warning: Boolean(row.f5),      // Chuyển sang Boolean (vì là BIT(1))
      stock_status: row.f6,
      last_updated_at: row.f7          // Giữ nguyên (Date/String)
    }));
  }
  return [];
}