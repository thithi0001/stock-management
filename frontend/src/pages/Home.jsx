import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const styles = {
    container: { padding: "40px", textAlign: "center" },
    button: {
      backgroundColor: "#dc3545",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <h2>Xin chào, {user?.full_name} 👋</h2>
      <p>
        Vai trò: <b>{user?.role}</b>
      </p>

      <button onClick={handleLogout} style={styles.button}>
        Đăng xuất
      </button>
    </div>
  );
}
