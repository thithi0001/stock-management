import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RefreshProvider } from "./context/RefreshContext";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RefreshProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </RefreshProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
