/**
 * Lấy báo cáo Nhập kho theo tháng/năm
 * Khớp với API: GET /api/reports/import?month=...&year=...
 */
export const getImportReport = async (api, params) => {
  const res = await api.get('/api/reports/import', { params }); // params: { month, year }
  return res.data;
};

/**
 * Lấy báo cáo Xuất kho theo tháng/năm
 * Khớp với API: GET /api/reports/export?month=...&year=...
 */
export const getExportReport = async (api, params) => {
  const res = await api.get('/api/reports/export', { params }); // params: { month, year }
  return res.data;
};

/**
 * Lấy báo cáo Tồn kho hiện tại
 * Khớp với API: GET /api/reports/inventory
 */
export const getInventoryReport = async (api) => {
  const res = await api.get('/api/reports/inventory');
  return res.data;
};