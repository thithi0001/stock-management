import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  const styles = {
    container: { padding: "40px", textAlign: "center" },
  };

  return (
    <div style={styles.container}>
      <h2>Xin chào, {user?.full_name} 👋</h2>
      <p>
        Vai trò: <b>{user?.role}</b>
      </p>
    </div>
  );
}
