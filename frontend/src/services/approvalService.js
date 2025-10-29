/**
 * Lấy tất cả phiếu xuất (khớp với route GET /)
 * @param {AxiosInstance} api - Instance của Axios
 */
export const getAllExportReceipts = async (api) => {
  const res = await api.get("/api/approval-export");
  return res.data;
};

/**
 * Lọc phiếu xuất theo trạng thái (khớp với route GET /status/:status)
 * @param {AxiosInstance} api - Instance của Axios
 * @param {string} status - Trạng thái ('pending', 'approved', 'rejected')
 */
export const getExportReceiptsByStatus = async (api, status) => {
  const res = await api.get(`/api/approval-export/status/${status}`);
  return res.data;
};

/**
 * (MỚI) Lấy chi tiết một phiếu xuất (khớp với route GET /:id)
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của phiếu xuất
 */
export const getExportReceiptDetails = async (api, id) => {
  const res = await api.get(`/api/approval-export/${id}`);
  return res.data;
};

/**
 * Duyệt hoặc từ chối phiếu xuất (khớp với route POST /:id)
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của phiếu xuất
 * @param {string} newStatus - Trạng thái mới ('approved' hoặc 'rejected')
 * @param {string} reason - Lý do (nếu có)
 */
export const approveExport = async (api, id, newStatus, reason = '') => {
  const payload = { 
    new_status: newStatus, 
    reason: reason 
  };
  const res = await api.post(`/api/approval-export/${id}`, payload);
  return res.data;
};