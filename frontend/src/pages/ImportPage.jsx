import React, { useState, useEffect, useCallback } from 'react';
// (ĐÃ THAY ĐỔI) Xóa createImportReceipt, getSuppliers, getProducts
import { 
  fetchImportReceipts,
  fetchImportReceiptById
} from '../services/importService';
import { useApi } from '../services/api';
// (ĐÃ THÊM) Import Modal
import ImportModal from '../components/modals/ImportModal'; 

// --- Helpers (Giữ nguyên) ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('vi-VN', options);
};
const STATUS_CONFIG = {
  pending: { text: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
  approved: { text: "Đã duyệt", className: "bg-green-100 text-green-800" },
  rejected: { text: "Đã từ chối", className: "bg-red-100 text-red-800" },
};
const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];

// --- Component Modal Tạo Phiếu Nhập (ĐÃ BỊ XÓA) ---
// ...
// ... Code của ImportModal đã được chuyển sang file riêng
// ...


// --- Component Trang Chính ---
export default function ImportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('all');

  // State cho modal chi tiết
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const api = useApi();

  // Load danh sách phiếu nhập
  const load = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchImportReceipts(api, status);
      setList(res ?? []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load(currentStatus);
  }, [load, currentStatus]);

  const handleCreated = () => {
    load(currentStatus); // Tải lại danh sách sau khi tạo
  };

  // Mở modal xem chi tiết
  const handleViewDetails = async (id) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetchImportReceiptById(api, id);
      setDetailData(res);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };
  
  const closeDetailModal = () => {
    setIsDetailOpen(false);
    setDetailData(null);
    setError(null);
  }

  // --- Render Functions ---

  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`py-3 px-5 text-gray-600 font-medium cursor-pointer border-b-2 transition duration-150 ease-in-out
            ${currentStatus === tab.key 
              ? 'text-blue-600 border-blue-600' 
              : 'border-transparent hover:bg-gray-100 hover:text-gray-800'
            }`}
          onClick={() => setCurrentStatus(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderTable = () => {
    if (loading) return <div className="p-10 text-center text-lg text-gray-500">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>;
    if (list.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không có phiếu nhập nào.</div>;

    return (
      <div className="shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà cung cấp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.map(r => {
              const statusInfo = STATUS_CONFIG[r.receipt_status] || { text: r.receipt_status, className: "bg-gray-100 text-gray-800" };
              return (
                <tr key={r.receipt_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{r.receipt_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.suppliers?.supplier_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.user_accounts?.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(r.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold inline-block ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">{formatCurrency(r.total_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => handleViewDetails(r.receipt_id)}>
                      Xem
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderDetailModal = () => {
    if (!isDetailOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Chi tiết Phiếu Nhập</h2>
            <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {detailLoading ? (
              <div className="p-10 text-center text-lg text-gray-500">Đang tải chi tiết...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>
            ) : detailData ? (
              <>
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <p><strong>ID Phiếu:</strong> #{detailData.receipt_id}</p>
                  <p><strong>Nhà cung cấp:</strong> {detailData.suppliers?.supplier_name}</p>
                  <p><strong>Người tạo:</strong> {detailData.user_accounts?.full_name}</p>
                  <p><strong>Ngày tạo:</strong> {formatDate(detailData.created_at)}</p>
                  <p><strong>Tổng tiền:</strong> {formatCurrency(detailData.total_amount)}</p>
                </div>
                <h3 className="text-lg font-semibold mb-3">Danh sách sản phẩm</h3>
                <div className="shadow rounded-lg overflow-hidden border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.import_details?.map(item => (
                        <tr key={item.product_id}>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.products?.product_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(item.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Phiếu Nhập</h1>
        <button 
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out" 
          onClick={() => setIsModalOpen(true)}
        >
          + Tạo phiếu nhập
        </button>
      </div>

      {/* Modal tạo phiếu nhập */}
      <ImportModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={handleCreated} 
      />
      
      {/* Modal xem chi tiết */}
      {renderDetailModal()}

      {renderTabs()}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {renderTable()}
      </div>
    </div>
  );
}