import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/Home";
import { ROLES } from "../constants/roles";
import MainLayout from "../components/layout/MainLayout";
import ProductPage from "../pages/ProductPage";
import NotFoundPage from "../pages/NotFoundPage";
import StockPage from "../pages/StockPage";
import CreatePOPage from "../pages/CreatePOPage";
import GoodsReceiptPage from "../pages/GoodsReceiptPage";
import ExportPage from "../pages/ExportPage";
import ApprovalPage from "../pages/ApprovalPage";
import CustomerPage from "../pages/CustomerPage";

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
            <MainLayout>
              <Home />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProductPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/stocks"
        element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.STOREKEEPER]}>
            <MainLayout>
              <StockPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/import"
        element={
          <ProtectedRoute allowedRoles={[ROLES.IMPORTSTAFF, ROLES.STOREKEEPER]}>
            <MainLayout>
              <CreatePOPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/import-order"
        element={
          <ProtectedRoute allowedRoles={[ROLES.IMPORTSTAFF, ROLES.STOREKEEPER]}>
            <MainLayout>
              <GoodsReceiptPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/export"
        element={
          <ProtectedRoute allowedRoles={[ROLES.EXPORTSTAFF, ROLES.STOREKEEPER]}>
            <MainLayout>
              <ExportPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/approval"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STOREKEEPER]}>
            <MainLayout>
              <ApprovalPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.STOREKEEPER]}>
            <MainLayout>
              <Home />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Home />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CustomerPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/notfound" element={<NotFoundPage />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;
