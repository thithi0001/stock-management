// Thay các hàm để nhận axios instance (api) - tương thích với useApi() hook
export const getProducts = async (api) => {
  const res = await api.get("/api/products");
  return res.data;
};

export const createProduct = async (api, productData) => {
  const res = await api.post("/api/products", productData);
  return res.data;
};

export const updateProduct = async (api, id, updatedData) => {
  const res = await api.put(`/api/products/${id}`, updatedData);
  return res.data;
};