import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const testAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
  }
};

const API = axios.create({
  baseURL: API_BASE_URL, // đổi thành URL backend thật của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = async (username, password) => {
  try {
    const response = await API.post("/api/auth/login", { username, password });
    return response.data; // token, payload, ...
  } catch (error) {
    throw error.response?.data || { message: "Lỗi kết nối server" };
  }
};

// hook sử dụng API với token
export const useApi = () => {
  const { token } = useAuth();

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return api;
};