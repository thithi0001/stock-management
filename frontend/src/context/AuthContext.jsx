import { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }); // null = chưa đăng nhập

  const applyToken = (tok) => {
    if (tok) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${tok}`;
      localStorage.setItem("token", tok);
      setToken(tok);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setToken(null);
    }
  };

  const login = (response) => {
    // Hợp nhất các dạng response có thể: response.token / response.data.token / response.payload
    const tok = response?.token ?? response?.data?.token ?? response?.token;
    const usr = response?.user ?? response?.data?.user ?? response?.payload ?? null;

    if (!tok) throw new Error("No token in login response");

    applyToken(tok);
    if (usr) {
      try { localStorage.setItem("user", JSON.stringify(usr)); } catch {}
      setUser(usr);
    } else {
      // nếu backend không trả user, có thể decode từ token
      const decoded = decodeJwt(tok);
      if (decoded) {
        const inferredUser = { id: decoded.id, username: decoded.username, role_id: decoded.role_id };
        try { localStorage.setItem("user", JSON.stringify(inferredUser)); } catch {}
        setUser(inferredUser);
      }
    }
  };

  const logout = useCallback(() => {
    applyToken(null);
    setUser(null);
    try {
      localStorage.removeItem("user");
    } catch {};
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const decoded = decodeJwt(token);
      if (decoded && decoded.exp && Date.now() / 1000 > decoded.exp) {
        // token hết hạn -> logout
        logout();
      }
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
