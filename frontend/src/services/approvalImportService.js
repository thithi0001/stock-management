/**
 * (MỚI)
 * Lấy danh sách phiếu nhập cần duyệt (hoặc đã duyệt) theo trạng thái.
 * Dành cho Thủ kho.
 * Khớp với API: GET /api/approval-import/status/:status
 * @param {AxiosInstance} api - Instance của Axios
 * @param {string} status - Trạng thái ('pending', 'approved', 'rejected', 'all')
 */
export const getImportApprovalsByStatus = async (api, status) => {
  const res = await api.get(`/api/approval-import/status/${status}`);
  return res.data; // Backend trả về mảng [...]
};

/**
 * (MỚI)
 * Thủ kho duyệt hoặc từ chối một phiếu nhập.
 * Khớp với API: POST /api/approval-import/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của phiếu nhập (import_receipt_id)
 * @param {object} payload - Dữ liệu duyệt, ví dụ: { new_status: 'approved', reason: '...' }
 */
export const approveImportReceipt = async (api, id, payload) => {
  const { new_status, reason } = payload;
  const res = await api.post(`/api/approval-import/${id}`, { new_status, reason });
  return res.data; // Backend trả về { message, approval }
};