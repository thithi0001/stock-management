/**
 * (MỚI)
 * Tạo một phiếu nhập mới, bao gồm cả chi tiết sản phẩm (details).
 * Khớp với API: POST /api/import
 * @param {AxiosInstance} api - Instance của Axios
 * @param {object} receiptData - Payload, ví dụ: { supplier_id, total_amount, details: [...] }
 */
export const createImportReceipt = async (api, receiptData) => {
  // Gửi toàn bộ payload trong một lần gọi
  const res = await api.post('/api/import', receiptData);
  return res.data; // Backend trả về { message, receipt }
};

/**
 * (MỚI)
 * Lấy danh sách phiếu nhập, hỗ trợ lọc theo trạng thái.
 * Khớp với API: GET /api/import?status=...
 * @param {AxiosInstance} api - Instance của Axios
 * @param {string} status - (Tùy chọn) Trạng thái để lọc (vd: 'pending', 'approved')
 */
export const fetchImportReceipts = async (api, status = '') => {
  // Xây dựng query params
  const params = {};
  if (status && status !== 'all') {
    params.status = status;
  }

  const res = await api.get('/api/import', { params });
  return res.data; // Backend trả về mảng [...]
};

/**
 * (MỚI)
 * Lấy chi tiết một phiếu nhập bằng ID.
 * Khớp với API: GET /api/import/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của phiếu nhập
 */
export const fetchImportReceiptById = async (api, id) => {
  const res = await api.get(`/api/import/${id}`);
  return res.data; // Backend trả về object { receipt_id, ... }
};