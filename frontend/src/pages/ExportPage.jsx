import React, { useEffect, useState, useCallback } from 'react';
import ExportModal from '../components/modals/ExportModal';
import { fetchExportReceipts, fetchExportById } from '../services/exportService';
import { useApi } from '../services/api';
import { useRefresh } from '../context/RefreshContext';

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
// (ĐÃ SỬA) Đổi tên TABS thành STATUS_FILTER_OPTIONS cho rõ nghĩa
const STATUS_FILTER_OPTIONS = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];

export default function ExportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // (MỚI) State cho Tìm kiếm và Lọc
  const [exportSearch, setExportSearch] = useState('');
  const [exportStatusFilter, setExportStatusFilter] = useState('all'); // Mặc định là 'all'
  const debouncedExportSearch = useDebounce(exportSearch, 300);

  // State cho modal chi tiết
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const api = useApi();
  const { refreshKey, triggerRefresh } = useRefresh();

  // (CẬP NHẬT) Hàm load giờ nhận status từ state 'exportStatusFilter'
  const load = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API với status được chọn
      const res = await fetchExportReceipts(api, status);
      setList(res ?? []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [api]);

  // (CẬP NHẬT) useEffect gọi load khi status filter thay đổi
  useEffect(() => {
    load(exportStatusFilter);
  }, [load, exportStatusFilter, refreshKey]);

  // Hàm onCreated chỉ cần tải lại status hiện tại
  const handleCreated = () => {
    load(exportStatusFilter);
  };

  // Hàm mở modal chi tiết (Giữ nguyên)
  const handleViewDetails = async (id) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetchExportById(api, id);
      setDetailData(res.data);
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

  // (MỚI) Render thanh tìm kiếm/lọc
  const renderFilterControls = () => {
    return (
      <div className="flex flex-wrap gap-4 mb-4">
        <input 
          type="text"
          value={exportSearch}
          onChange={(e) => setExportSearch(e.target.value)}
          placeholder="Tìm theo Khách hàng, Người tạo, ID Phiếu..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minWidth: '250px' }}
        />
        <select
          value={exportStatusFilter}
          onChange={(e) => setExportStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_FILTER_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  };

  // (CẬP NHẬT) Bảng hiển thị (thêm logic filter)
  const renderTable = () => {
    // (MỚI) Lọc danh sách trước khi render
    const filteredList = list.filter(r => {
      if (!debouncedExportSearch) return true;
      const query = debouncedExportSearch.toLowerCase();
      return (
        (r.customers?.customer_name || '').toLowerCase().includes(query) ||
        (r.user_accounts?.full_name || '').toLowerCase().includes(query) ||
        r.receipt_id.toString().includes(query)
      );
    });

    if (loading) return <div className="p-10 text-center text-lg text-gray-500">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>;
    // (ĐÃ SỬA) Kiểm tra filteredList thay vì list
    if (filteredList.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không có phiếu xuất nào khớp.</div>;

    return (
      <div className="shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* (ĐÃ SỬA) Map qua filteredList */}
            {filteredList.map(r => {
              const statusInfo = STATUS_CONFIG[r.receipt_status] || { text: r.receipt_status, className: "bg-gray-100 text-gray-800" };
              return (
                <tr key={r.receipt_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{r.receipt_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.customers?.customer_name || 'N/A'}</td>
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
                    {/* (MỚI) Thêm nút xem lý do từ chối */}
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
    
    // (MỚI) Lấy thông tin duyệt/từ chối (nếu có)
    // Giả định backend trả về approval_exports trong chi tiết phiếu
    const approvalInfo = detailData?.approval_exports?.[0];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Chi tiết Phiếu xuất</h2>
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
                  <p><strong>Khách hàng:</strong> {detailData.customers?.customer_name}</p>
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
                      {detailData.export_details?.map(item => (
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
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Phiếu xuất</h1>
        <button 
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out" 
          onClick={() => setIsModalOpen(true)}
        >
          + Tạo phiếu xuất
        </button>
      </div>

      {/* Modal tạo phiếu xuất */}
      <ExportModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />
      
      {/* Modal xem chi tiết */}
      {renderDetailModal()}
      
      {/* (MỚI) Thêm thanh Filter */}
      {renderFilterControls()}

      {/* Bảng dữ liệu */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {renderTable()}
      </div>
    </div>
  );
}

// (MỚI) Thêm hook useDebounce
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