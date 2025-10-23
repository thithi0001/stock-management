import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Chưa đăng nhập
  if (!user) return <Navigate to="/login" replace />;

  // Nếu có giới hạn role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <h3 style={{ textAlign: "center", marginTop: "50px" }}>🚫 Không có quyền truy cập</h3>;
  }

  return children;
}