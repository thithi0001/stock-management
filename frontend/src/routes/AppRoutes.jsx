import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/Home";
import { ROLES } from "../constants/roles"

function AppRoutes() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/import"
        element={
          <ProtectedRoute allowedRoles={[ROLES.IMPORTSTAFF, ROLES.STOREKEEPER]}>
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/export"
        element={
          <ProtectedRoute allowedRoles={[ROLES.IMPORTSTAFF, ROLES.STOREKEEPER]}>
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/stock"
        element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.STOREKEEPER]}>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.STOREKEEPER]}>
            <Home />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default AppRoutes;
