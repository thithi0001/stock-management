/**
 * (CẢI TIẾN)
 * Lấy danh sách khách hàng, hỗ trợ phân trang và tìm kiếm.
 * Khớp với API: GET /api/customers?page=...&limit=...&q=...
 * @param {AxiosInstance} api - Instance của Axios
 * @param {object} params - Tùy chọn, ví dụ: { page: 1, limit: 10, q: 'searchText' }
 */
export const getCustomers = async (api, params = {}) => {
  const res = await api.get('/api/customers', { params });
  return res.data; // Backend trả về { data: [...], meta: {...} }
};

/**
 * (MỚI)
 * Lấy chi tiết một khách hàng bằng ID.
 * Khớp với API: GET /api/customers/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của khách hàng
 */
export const getCustomerById = async (api, id) => {
  const res = await api.get(`/api/customers/${id}`);
  return res.data; // Backend trả về { customer_id, ... }
};

/**
 * (MỚI)
 * Tạo một khách hàng mới.
 * Khớp với API: POST /api/customers
 * @param {AxiosInstance} api - Instance của Axios
 * @param {object} customerData - Dữ liệu khách hàng mới (name, address, phone, email)
 */
export const createCustomer = async (api, customerData) => {
  const res = await api.post('/api/customers', customerData);
  return res.data; // Backend trả về { customer_id, ... }
};

/**
 * (MỚI)
 * Cập nhật thông tin khách hàng.
 * Khớp với API: PUT /api/customers/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của khách hàng
 * @param {object} customerData - Dữ liệu khách hàng cập nhật
 */
export const updateCustomer = async (api, id, customerData) => {
  const res = await api.put(`/api/customers/${id}`, customerData);
  return res.data; // Backend trả về { customer_id, ... }
};

/**
 * (MỚI)
 * Xóa một khách hàng.
 * Khớp với API: DELETE /api/customers/:id
 * @param {AxiosInstance} api - Instance của Axios
 * @param {number|string} id - ID của khách hàng
 */
export const deleteCustomer = async (api, id) => {
  const res = await api.delete(`/api/customers/${id}`);
  return res.data; // Backend trả về { message: "..." }
};