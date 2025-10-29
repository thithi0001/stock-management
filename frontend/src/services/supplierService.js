/**
 * (MỚI)
 * Lấy danh sách nhà cung cấp, hỗ trợ phân trang và tìm kiếm.
 * Khớp với API: GET /api/suppliers?page=...&limit=...&q=...
 * @param {AxiosInstance} api - Instance của Axios
 * @param {object} params - Tùy chọn, ví dụ: { page: 1, limit: 10, q: 'searchText' }
 */
export const getSuppliers = async (api, params = {}) => {
  const res = await api.get('/api/suppliers', { params });
  return res.data; // Backend trả về { data: [...], meta: {...} }
};

/**
 * (MỚI)
 * Lấy chi tiết một nhà cung cấp bằng ID.
 * Khớp với API: GET /api/suppliers/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của nhà cung cấp
 */
export const getSupplierById = async (api, id) => {
  const res = await api.get(`/api/suppliers/${id}`);
  return res.data; // Backend trả về { supplier_id, ... }
};

/**
 * (MỚI)
 * Tạo một nhà cung cấp mới.
 * Khớp với API: POST /api/suppliers
 * @param {AxiosInstance} api - Instance của Axios
 * @param {object} supplierData - Dữ liệu nhà cung cấp mới (name, address, phone, email)
 */
export const createSupplier = async (api, supplierData) => {
  const res = await api.post('/api/suppliers', supplierData);
  return res.data; // Backend trả về { supplier_id, ... }
};

/**
 * (MỚI)
 * Cập nhật thông tin nhà cung cấp.
 * Khớp với API: PUT /api/suppliers/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của nhà cung cấp
 * @param {object} supplierData - Dữ liệu nhà cung cấp cập nhật
 */
export const updateSupplier = async (api, id, supplierData) => {
  const res = await api.put(`/api/suppliers/${id}`, supplierData);
  return res.data; // Backend trả về { supplier_id, ... }
};

/**
 * (MỚI)
 * Xóa một nhà cung cấp.
 * Khớp với API: DELETE /api/suppliers/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của nhà cung cấp
 */
export const deleteSupplier = async (api, id) => {
  const res = await api.delete(`/api/suppliers/${id}`);
  return res.data; // Backend trả về { message: "..." }
};