import { prisma } from "../config/db.js";

/**
 * (MỚI)
 * Lấy danh sách nhà cung cấp có phân trang và tìm kiếm
 */
export async function getAllSuppliers(options = {}) {
  const { page = 1, limit = 10, q = '' } = options;
  const skip = (page - 1) * limit;

  // Điều kiện tìm kiếm (tìm theo tên, SĐT, hoặc email)
  const whereClause = q ? {
    OR: [
      { supplier_name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ],
  } : {};

  // 1. Lấy tổng số lượng bản ghi
  const totalSuppliers = await prisma.suppliers.count({
    where: whereClause,
  });

  // 2. Lấy dữ liệu đã phân trang
  const suppliers = await prisma.suppliers.findMany({
    where: whereClause,
    select: {
      supplier_id: true,
      supplier_name: true,
      address: true,
      phone: true,
      email: true,
    },
    skip: skip,
    take: limit,
    orderBy: {
      supplier_name: 'asc' // Sắp xếp theo tên
    }
  });

  return {
    data: suppliers,
    meta: {
      total: totalSuppliers,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalSuppliers / limit),
    }
  };
}

/**
 * (MỚI)
 * Lấy chi tiết một nhà cung cấp theo ID
 */
export async function getSupplierById(id) {
  return await prisma.suppliers.findUnique({
    where: { supplier_id: id },
    select: {
      supplier_id: true,
      supplier_name: true,
      address: true,
      phone: true,
      email: true,
    }
  });
}

/**
 * (MỚI)
 * Thêm một nhà cung cấp mới
 */
export async function createSupplier(data) {
  const { supplier_name, address, phone, email } = data;

  // Kiểm tra trùng lặp
  const existing = await prisma.suppliers.findFirst({
    where: {
      OR: [
        { supplier_name },
        { phone },
        { email }
      ]
    }
  });

  if (existing) {
    if (existing.supplier_name === supplier_name) {
      throw new Error("Tên nhà cung cấp đã tồn tại");
    }
    if (existing.phone === phone) {
      throw new Error("Số điện thoại đã tồn tại");
    }
    if (existing.email === email) {
      throw new Error("Email đã tồn tại");
    }
  }

  return await prisma.suppliers.create({
    data: {
      supplier_name,
      address,
      phone,
      email,
    }
  });
}

/**
 * (MỚI)
 * Cập nhật thông tin nhà cung cấp
 */
export async function updateSupplier(id, data) {
  const { supplier_name, address, phone, email } = data;

  // Kiểm tra trùng lặp với các nhà cung cấp khác
  const existing = await prisma.suppliers.findFirst({
    where: {
      OR: [
        { supplier_name },
        { phone },
        { email }
      ],
      NOT: {
        supplier_id: id // Loại trừ chính nhà cung cấp này
      }
    }
  });

  if (existing) {
     if (existing.supplier_name === supplier_name) {
      throw new Error("Tên nhà cung cấp đã tồn tại");
    }
    if (existing.phone === phone) {
      throw new Error("Số điện thoại đã tồn tại");
    }
    if (existing.email === email) {
      throw new Error("Email đã tồn tại");
    }
  }

  return await prisma.suppliers.update({
    where: { supplier_id: id },
    data: {
      supplier_name,
      address,
      phone,
      email,
    }
  });
}

/**
 * (MỚI)
 * Xoá một nhà cung cấp
 */
export async function deleteSupplier(id) {
  // Lưu ý: Nếu nhà cung cấp đã có trong phiếu nhập (import_receipts),
  // việc xoá này sẽ thất bại do ràng buộc khoá ngoại (P2003).
  return await prisma.suppliers.delete({
    where: { supplier_id: id },
  });
}