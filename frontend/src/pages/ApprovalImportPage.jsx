import React, { useState, useEffect, useCallback } from 'react';
import { 
  getImportApprovalsByStatus, 
  approveImportReceipt 
} from '../services/approvalImportService';
// (QUAN TRỌNG) Import hàm xem chi tiết từ service phiếu nhập
import { fetchImportReceiptById } from '../services/importService'; 
import { useApi } from '../services/api';

// --- Helpers ---
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
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];
// --- Base Button Styles ---
const btnBase = "py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
const btnView = `${btnBase} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
const btnApprove = `${btnBase} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`;
const btnReject = `${btnBase} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
const btnSecondary = `${btnBase} text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400`;

function ApprovalImportPage() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('pending'); // Mặc định là 'chờ duyệt'

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailData, setDetailData] = useState(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  
  const [actionType, setActionType] = useState('approved');
  const [actionReason, setActionReason] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const api = useApi();

  // Hàm gọi API để lấy danh sách phiếu
  const fetchReceipts = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getImportApprovalsByStatus(api, status);
      setReceipts(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Tự động gọi API khi 'currentTab' thay đổi
  useEffect(() => {
    fetchReceipts(currentTab);
  }, [currentTab, fetchReceipts]);

  // Mở modal xem chi tiết
  const handleViewDetails = async (receipt) => {
    // Lấy ID chính xác, bất kể cấu trúc (pending hay đã duyệt)
    const receiptId = receipt.receipt_id || receipt.import_receipt_id;
    
    setSelectedReceipt(receipt);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setError(null);
    try {
      // Gọi API chi tiết từ service 'importService'
      const data = await fetchImportReceiptById(api, receiptId);
      setDetailData(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // Mở modal duyệt/từ chối
  const handleOpenActionModal = (receipt, type) => {
    setSelectedReceipt(receipt);
    setActionType(type);
    setIsActionModalOpen(true);
    setActionReason(''); // Reset lý do
  };

  const handleCloseModals = () => {
    setIsDetailModalOpen(false);
    setIsActionModalOpen(false);
    setDetailData(null);
  }

  // Xác nhận hành động duyệt/từ chối
  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (actionType === 'rejected' && !actionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    
    setActionLoading(true);
    setError(null);
    
    // Lấy ID của phiếu nhập
    const receiptId = selectedReceipt.receipt_id || selectedReceipt.import_receipt_id;
    
    try {
      const payload = {
        new_status: actionType,
        reason: actionReason
      };
      
      const result = await approveImportReceipt(api, receiptId, payload);
      
      alert(result.message || 'Thao tác thành công!');
      handleCloseModals();
      fetchReceipts(currentTab); // Tải lại danh sách
    } catch (err) {
      console.error(err);
      alert(`Lỗi: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Render Functions ---

  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`py-3 px-5 text-gray-600 font-medium cursor-pointer border-b-2 transition duration-150 ease-in-out
            ${currentTab === tab.key 
              ? 'text-blue-600 border-blue-600' 
              : 'border-transparent hover:bg-gray-100 hover:text-gray-800'
            }`}
          onClick={() => setCurrentTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderTable = () => {
    if (loading) return <div className="p-10 text-center text-lg text-gray-500">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>;
    if (receipts.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không có phiếu nào.</div>;

    const isPendingTab = currentTab === 'pending';

    return (
      <div className="shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Phiếu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà cung cấp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày {isPendingTab ? 'tạo' : 'duyệt'}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map(r => {
              // Xử lý 2 cấu trúc JSON khác nhau từ API
              const receipt_id = r.receipt_id || r.import_receipt_id;
              const status = r.receipt_status || r.new_status;
              const supplier = r.suppliers?.supplier_name || r.supplier_name;
              const createdBy = r.user_accounts?.full_name || r.requested_by_name;
              const date = r.created_at || r.approved_at;
              
              const statusInfo = STATUS_CONFIG[status] || { text: status, className: "" };
              
              return (
                <tr key={receipt_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{receipt_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supplier || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{createdBy || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">{formatCurrency(r.total_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold inline-block ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className={btnView} onClick={() => handleViewDetails(r)}>Xem</button>
                    {status === 'pending' && (
                      <>
                        <button className={btnApprove} onClick={() => handleOpenActionModal(r, 'approved')}>Duyệt</button>
                        <button className={btnReject} onClick={() => handleOpenActionModal(r, 'rejected')}>Từ chối</button>
                      </>
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

  const renderDetailModal = () => {
    if (!isDetailModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Chi tiết Phiếu Nhập</h2>
            <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {detailLoading ? (
              <div className="p-10 text-center text-lg text-gray-500">Đang tải chi tiết...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>
            ) : detailData ? (
              <>
                <div className="pb-4 mb-4 border-b border-gray-200 space-y-1">
                  <p><strong>ID Phiếu:</strong> #{detailData.receipt_id}</p>
                  <p><strong>Nhà cung cấp:</strong> {detailData.suppliers?.supplier_name}</p>
                  <p><strong>Người tạo:</strong> {detailData.user_accounts?.full_name}</p>
                  <p><strong>Ngày tạo:</strong> {formatDate(detailData.created_at)}</p>
                  <p><strong>Tổng tiền:</strong> {formatCurrency(detailData.total_amount)}</p>
                  <p><strong>Trạng thái:</strong> {STATUS_CONFIG[detailData.receipt_status].text}</p>
                  {detailData.approval_imports && detailData.approval_imports.length > 0 && (
                    <>
                      <p><strong>Người duyệt:</strong> {detailData.approval_imports[0].user_accounts?.full_name}</p>
                      <p><strong>Ngày duyệt:</strong> {formatDate(detailData.approval_imports[0].approved_at)}</p>
                      <p><strong>Ghi chú:</strong> {detailData.approval_imports[0].reason}</p>
                    </>
                  )}
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

  const renderActionModal = () => {
    if (!isActionModalOpen) return null;
    
    const isReject = actionType === 'rejected';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <form onSubmit={handleConfirmAction} className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Xác nhận {isReject ? 'Từ chối' : 'Duyệt'} Phiếu Nhập</h2>
            <button type="button" onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
          </div>
          <div className="p-6">
            <p className="text-base text-gray-700">Bạn có chắc muốn <strong>{isReject ? 'TỪ CHỐI' : 'DUYỆT'}</strong> phiếu nhập <strong>#{selectedReceipt.receipt_id || selectedReceipt.import_receipt_id}</strong> không?</p>
            {isReject && (
              <div className="mt-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">Lý do từ chối (bắt buộc):</label>
                <textarea
                  id="reason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={actionLoading}
                  required
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
            <button type="button" className={btnSecondary} onClick={handleCloseModals} disabled={actionLoading}>Hủy bỏ</button>
            <button type="submit" className={isReject ? btnReject : btnApprove} disabled={actionLoading}>
              {actionLoading ? 'Đang xử lý...' : `Xác nhận ${isReject ? 'Từ chối' : 'Duyệt'}`}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Duyệt Phiếu Nhập Hàng</h1>
      {renderTabs()}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {renderTable()}
      </div>
      {renderDetailModal()}
      {renderActionModal()}
    </div>
  );
}

export default ApprovalImportPage;