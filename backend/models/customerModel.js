import { prisma } from "../config/db.js";
/**
 * (CẢI TIẾN)
 * Lấy danh sách khách hàng có phân trang và tìm kiếm
 */
export async function getAllCustomer(options = {}) {
  const { page = 1, limit = 10, q = '' } = options;
  const skip = (page - 1) * limit;

  // Điều kiện tìm kiếm (tìm theo tên, SĐT, hoặc email)
  const whereClause = q ? {
    OR: [
      { customer_name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ],
  } : {};

  // 1. Lấy tổng số lượng bản ghi
  const totalCustomers = await prisma.customers.count({
    where: whereClause,
  });

  // 2. Lấy dữ liệu đã phân trang
  const customers = await prisma.customers.findMany({
    where: whereClause,
    select: {
      customer_id: true,
      customer_name: true,
      address: true,
      phone: true,
      email: true,
    },
    skip: skip,
    take: limit,
    orderBy: {
      customer_name: 'asc' // Sắp xếp theo tên
    }
  });

  return {
    data: customers,
    meta: {
      total: totalCustomers,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCustomers / limit),
    }
  };
}

/**
 * (MỚI)
 * Lấy chi tiết một khách hàng theo ID
 */
export async function getCustomerById(id) {
  return await prisma.customers.findUnique({
    where: { customer_id: id },
    select: {
      customer_id: true,
      customer_name: true,
      address: true,
      phone: true,
      email: true,
    }
  });
}

/**
 * (MỚI)
 * Thêm một khách hàng mới
 */
export async function createCustomer(data) {
  const { customer_name, address, phone, email } = data;

  // Kiểm tra trùng lặp (tùy chọn nhưng nên có)
  const existing = await prisma.customers.findFirst({
    where: {
      OR: [
        { customer_name },
        { phone },
        { email }
      ]
    }
  });

  if (existing) {
    if (existing.customer_name === customer_name) {
      throw new Error("Tên khách hàng đã tồn tại");
    }
    if (existing.phone === phone) {
      throw new Error("Số điện thoại đã tồn tại");
    }
    if (existing.email === email) {
      throw new Error("Email đã tồn tại");
    }
  }

  return await prisma.customers.create({
    data: {
      customer_name,
      address,
      phone,
      email,
    }
  });
}

/**
 * (MỚI)
 * Cập nhật thông tin khách hàng
 */
export async function updateCustomer(id, data) {
  const { customer_name, address, phone, email } = data;

  // Kiểm tra trùng lặp với các khách hàng khác
  const existing = await prisma.customers.findFirst({
    where: {
      OR: [
        { customer_name },
        { phone },
        { email }
      ],
      NOT: {
        customer_id: id // Loại trừ chính khách hàng này
      }
    }
  });

  if (existing) {
     if (existing.customer_name === customer_name) {
      throw new Error("Tên khách hàng đã tồn tại");
    }
    if (existing.phone === phone) {
      throw new Error("Số điện thoại đã tồn tại");
    }
    if (existing.email === email) {
      throw new Error("Email đã tồn tại");
    }
  }

  return await prisma.customers.update({
    where: { customer_id: id },
    data: {
      customer_name,
      address,
      phone,
      email,
    }
  });
}

/**
 * (MỚI)
 * Xoá một khách hàng
 */
export async function deleteCustomer(id) {
  // Cẩn thận: Nếu khách hàng đã có trong phiếu xuất (export_receipts),
  // việc xoá này sẽ thất bại do ràng buộc khoá ngoại (foreign key).
  // Đây là hành vi đúng để bảo vệ dữ liệu.
  return await prisma.customers.delete({
    where: { customer_id: id },
  });
}