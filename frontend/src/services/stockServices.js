export const getStocks = async (api) => {
  const res = await api.get("/api/stocks");
  return res.data;
};

export const createStock = async (api, stockData) => {
  const res = await api.post("/api/stocks", stockData);
  return res.data;
}

export const updateStock = async (api, id, updatedData) => {
  const res = await api.put(`/api/stocks/${id}`, updatedData);
  return res.data;
};