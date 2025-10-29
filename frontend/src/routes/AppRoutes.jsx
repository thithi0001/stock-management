import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/Home";
import { ROLES } from "../constants/roles";
import MainLayout from "../components/layout/MainLayout";
import ProductPage from "../pages/ProductPage";
import NotFoundPage from "../pages/NotFoundPage";
import StockPage from "../pages/StockPage";
import RestockPage from "../pages/RestockPage";
import GoodsReceiptPage from "../pages/GoodsReceiptPage";
import ExportPage from "../pages/ExportPage";
import ApprovalPage from "../pages/ApprovalPage";
import CustomerPage from "../pages/CustomerPage";
import SupplierPage from "../pages/SupplierPage";
import ImportPage from "../pages/ImportPage";

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
              <ImportPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/approval-import"
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
        path="/approval-export"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STOREKEEPER]}>
            <MainLayout>
              <ApprovalPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/restocks"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STOREKEEPER]}>
            <MainLayout>
              <RestockPage />
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
              <SupplierPage />
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
