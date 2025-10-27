import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useMemo } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const testAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
  }
};

export const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = async (username, password) => {
  try {
    const response = await API.post("/api/auth/login", { username, password });
    return response.data; // token, payload, ...
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// hook sử dụng API với token
export const useApi = () => {
  const { token, logout } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      withCredentials: false
    });

    const onResponseError = (error) => {
      const status = error.response?.status;
      if (status === 401) {
        try { logout(); } catch (error) { }
      }
      return Promise.reject(error);
    };

    instance.interceptors.response.use((r) => r, onResponseError);

    return instance;
  }, [token, logout]);
  
  return api;
};

export default useApi;