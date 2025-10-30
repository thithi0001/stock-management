import React, { useState, useEffect, useCallback } from 'react';
import { fetchImportReceipts, fetchImportReceiptById } from '../services/importService';
import { getAllRestockRequests } from '../services/restockServices';
import { useApi } from '../services/api';
import ImportModal from '../components/modals/ImportModal'; 
import { useRefresh } from '../context/RefreshContext';

// --- Helpers (Giữ nguyên) ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('vi-VN', options);
};
// Trạng thái phiếu nhập
const RECEIPT_STATUS_CONFIG = {
  pending: { text: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
  approved: { text: "Đã duyệt", className: "bg-green-100 text-green-800" },
  rejected: { text: "Đã từ chối", className: "bg-red-100 text-red-800" },
};
// Trạng thái yêu cầu
const REQUEST_STATUS_CONFIG = {
  pending: { text: "Chờ xử lý", className: "bg-blue-100 text-blue-800" },
  fulfilled: { text: "Đã xử lý", className: "bg-gray-100 text-gray-800" },
};
// Tabs nghiệp vụ
const VIEW_TABS = [
  { key: 'requests', label: 'Yêu cầu nhập hàng' },
  { key: 'receipts', label: 'Lịch sử phiếu nhập' },
];
// (MỚI) Filter cho tab lịch sử
const RECEIPT_STATUS_FILTER_OPTIONS = [
    { key: 'all', label: 'Tất cả trạng thái' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Đã từ chối' },
];


export default function ImportPage() {
  const [view, setView] = useState('requests'); // 'requests' hoặc 'receipts'
  const [restockRequests, setRestockRequests] = useState([]);
  const [importReceipts, setImportReceipts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (MỚI) State cho Tìm kiếm và Lọc
  const [requestSearch, setRequestSearch] = useState('');
  const [receiptSearch, setReceiptSearch] = useState('');
  const [receiptStatusFilter, setReceiptStatusFilter] = useState('all');
  const debouncedRequestSearch = useDebounce(requestSearch, 300);
  const debouncedReceiptSearch = useDebounce(receiptSearch, 300);

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // State cho modal chi tiết (của phiếu nhập)
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const api = useApi();
  const { refreshKey, triggerRefresh } = useRefresh();

  // Load cả Yêu cầu và Phiếu nhập
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqRes, receiptRes] = await Promise.all([
        getAllRestockRequests(api),
        fetchImportReceipts(api, 'all') // Lấy tất cả
      ]);
      setRestockRequests(reqRes ?? []);
      setImportReceipts(receiptRes ?? []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load(currentStatus);
  }, [load, currentStatus, refreshKey]);

  const handleCreated = () => {
    loadData(); // Tải lại cả 2 danh sách sau khi tạo
  };

  // Mở modal tạo phiếu nhập
  const handleOpenCreateModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
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
    setError(null); // Xóa lỗi cũ khi đóng modal
  }

  // --- Render Functions ---

  const renderViewTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      {VIEW_TABS.map(tab => (
        <button
          key={tab.key}
          className={`py-3 px-5 text-gray-600 font-medium cursor-pointer border-b-2 transition duration-150 ease-in-out
            ${view === tab.key 
              ? 'text-blue-600 border-blue-600' 
              : 'border-transparent hover:bg-gray-100 hover:text-gray-800'
            }`}
          onClick={() => setView(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // (MỚI) Render thanh tìm kiếm/lọc
  const renderFilterControls = () => {
    if (view === 'requests') {
      return (
        <div className="mb-4">
          <input 
            type="text"
            value={requestSearch}
            onChange={(e) => setRequestSearch(e.target.value)}
            placeholder="Tìm theo Tên SP hoặc ID Yêu cầu..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    }

    if (view === 'receipts') {
      return (
        <div className="flex flex-wrap gap-4 mb-4">
          <input 
            type="text"
            value={receiptSearch}
            onChange={(e) => setReceiptSearch(e.target.value)}
            placeholder="Tìm theo NCC, Người tạo, ID Phiếu..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minWidth: '250px' }}
          />
          <select
            value={receiptStatusFilter}
            onChange={(e) => setReceiptStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RECEIPT_STATUS_FILTER_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  };

  // (CẬP NHẬT) Bảng hiển thị Yêu cầu (thêm logic filter)
  const renderRequestsTable = () => {
    // Lọc các yêu cầu đang chờ xử lý (pending)
    const pendingRequests = restockRequests
      .filter(r => r.request_status === 'pending')
      .filter(r => { // Thêm logic tìm kiếm
        if (!debouncedRequestSearch) return true;
        const query = debouncedRequestSearch.toLowerCase();
        return (
          (r.products?.product_name || '').toLowerCase().includes(query) ||
          r.request_id.toString().includes(query)
        );
      });
    
    if (loading) return <div className="p-10 text-center text-lg text-gray-500">Đang tải...</div>;
    if (error) return <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>;
    if (pendingRequests.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không có yêu cầu nào cần xử lý.</div>;

    return (
      <div className="shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Yêu cầu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL Yêu cầu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Yêu cầu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingRequests.map(r => {
              const statusInfo = REQUEST_STATUS_CONFIG[r.request_status] || { text: r.request_status, className: "bg-gray-100 text-gray-800" };
              return (
                <tr key={r.request_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{r.request_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.products?.product_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">{r.requested_quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(r.requested_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold inline-block ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium" 
                      onClick={() => handleOpenCreateModal(r)}
                    >
                      Tạo phiếu nhập
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // (CẬP NHẬT) Bảng hiển thị Lịch sử (thêm logic filter + nút "Xem lý do")
  const renderReceiptsTable = () => {
    const filteredReceipts = importReceipts
      .filter(r => { // 1. Lọc theo trạng thái
        if (receiptStatusFilter === 'all') return true;
        return r.receipt_status === receiptStatusFilter;
      })
      .filter(r => { // 2. Lọc theo tìm kiếm
        if (!debouncedReceiptSearch) return true;
        const query = debouncedReceiptSearch.toLowerCase();
        return (
          (r.suppliers?.supplier_name || '').toLowerCase().includes(query) ||
          (r.user_accounts?.full_name || '').toLowerCase().includes(query) ||
          r.receipt_id.toString().includes(query)
        );
      });

    if (loading) return <div className="p-10 text-center text-lg text-gray-500">Đang tải...</div>;
    if (error) return <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>;
    if (filteredReceipts.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không có phiếu nhập nào.</div>;

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
            {filteredReceipts.map(r => {
              const statusInfo = RECEIPT_STATUS_CONFIG[r.receipt_status] || { text: r.receipt_status, className: "bg-gray-100 text-gray-800" };
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
                    {/* (MỚI) Thêm nút xem lý do */}
                    {r.receipt_status === 'rejected' && (
                      <button 
                        className="text-red-600 hover:text-red-800 font-medium ml-3" 
                        onClick={() => handleViewDetails(r.receipt_id)}
                      >
                        Xem lý do
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  // (CẬP NHẬT) Modal xem chi tiết (thêm hiển thị lý do)
  const renderDetailModal = () => {
    if (!isDetailOpen) return null;

    // (MỚI) Lấy thông tin duyệt/từ chối
    const approvalInfo = detailData?.approval_imports?.[0];

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
                {/* (MỚI) Hiển thị lý do từ chối nếu có */}
                {detailData.receipt_status === 'rejected' && approvalInfo && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-md mb-4">
                    <p className="font-semibold text-red-800">Bị từ chối bởi: {approvalInfo.user_accounts?.full_name || 'N/A'}</p>
                    <p className="text-red-700 mt-1"><strong>Lý do:</strong> {approvalInfo.reason || 'Không có lý do.'}</p>
                  </div>
                )}
                {detailData.receipt_status === 'approved' && approvalInfo && (
                  <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-md mb-4">
                    <p className="font-semibold text-green-800">Đã duyệt bởi: {approvalInfo.user_accounts?.full_name || 'N/A'}</p>
                  </div>
                )}
                
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

  // --- Render chính ---
  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Phiếu Nhập</h1>
      </div>

      {/* Modal tạo phiếu nhập (chỉ mở khi có selectedRequest) */}
      <ImportModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={handleCreated} 
        restockRequest={selectedRequest}
      />
      
      {/* Modal xem chi tiết */}
      {renderDetailModal()}

      {/* Hiển thị tabs nghiệp vụ */}
      {renderViewTabs()}
      
      {/* (MỚI) Thêm thanh Filter */}
      {renderFilterControls()}

      {/* Hiển thị bảng dựa trên tab đang chọn */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {view === 'requests' ? renderRequestsTable() : renderReceiptsTable()}
      </div>
    </div>
  );
}

// (MỚI) Thêm hook useDebounce (vì chúng ta đã xóa ở lần trước)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}