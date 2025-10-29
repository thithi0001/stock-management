/**
 * (CẢI TIẾN)
 * Tạo một phiếu xuất mới, bao gồm cả chi tiết sản phẩm (details).
 * Khớp với API: POST /api/export
 * @param {AxiosInstance} api - Instance của Axios
 * @param {object} receiptData - Payload, ví dụ: { customer_id, total_amount, details: [...] }
 */
export const createExportReceipt = async (api, receiptData) => {
  // Gửi toàn bộ payload trong một lần gọi
  const res = await api.post('/api/export', receiptData);
  return res.data;
};

/**
 * (CẢI TIẾN)
 * Lấy danh sách phiếu xuất, hỗ trợ lọc theo trạng thái.
 * Khớp với API: GET /api/export?status=...
 * @param {AxiosInstance} api - Instance của Axios
 * @param {string} status - (Tùy chọn) Trạng thái để lọc (vd: 'pending', 'approved')
 */
export const fetchExportReceipts = async (api, status = '') => {
  // Xây dựng query params
  const params = {};
  if (status && status !== 'all') {
    params.status = status;
  }

  const res = await api.get('/api/export', { params });
  return res.data;
};

/**
 * (CẬP NHẬT)
 * Lấy chi tiết một phiếu xuất bằng ID.
 * Khớp với API: GET /api/export/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của phiếu xuất
 */
export const fetchExportById = async (api, id) => {
  const res = await api.get(`/api/export/${id}`);
  return res.data;
};