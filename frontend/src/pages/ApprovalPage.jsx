import React, { useState, useEffect, useCallback } from 'react';
import { 
  getExportReceiptsByStatus, 
  getExportReceiptDetails, 
  approveExport 
} from '../services/approvalService';
import {useApi} from '../services/api';

// --- Helper Functions ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('vi-VN', options);
};

// Cập nhật STATUS_CONFIG để sử dụng class của Tailwind
const STATUS_CONFIG = {
  pending: { text: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
  approved: { text: "Đã duyệt", className: "bg-green-100 text-green-800" },
  rejected: { text: "Đã từ chối", className: "bg-red-100 text-red-800" },
};

const TABS = [
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
  { key: 'all', label: 'Tất cả' },
];

// --- Base Button Styles (Để tái sử dụng) ---
const btnBase = "py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
const btnView = `${btnBase} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
const btnApprove = `${btnBase} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`;
const btnReject = `${btnBase} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
const btnSecondary = `${btnBase} text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400`;

// --- ApprovalPage Component ---
function ApprovalPage() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('pending');

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailData, setDetailData] = useState(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  
  const [actionType, setActionType] = useState('approved');
  const [reason, setReason] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const api = useApi();

  const fetchReceipts = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExportReceiptsByStatus(api, status);
      setReceipts(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchReceipts(currentStatus);
  }, [currentStatus, fetchReceipts]);

  const handleViewDetails = async (receipt) => {
    setSelectedReceipt(receipt);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setError(null);
    try {
      const data = await getExportReceiptDetails(api, receipt.receipt_id);
      setDetailData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenActionModal = (receipt, type) => {
    setSelectedReceipt(receipt);
    setActionType(type);
    setIsActionModalOpen(true);
    setReason('');
  };
  
  const handleCloseModals = () => {
    setIsDetailModalOpen(false);
    setIsActionModalOpen(false);
    setDetailData(null); // Xóa data cũ
  }

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (actionType === 'rejected' && !reason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    
    setActionLoading(true);
    setError(null);
    try {
      const result = await approveExport(
        api, 
        selectedReceipt.receipt_id, 
        actionType, 
        reason
      );
      
      alert(result.message || 'Thao tác thành công!');
      handleCloseModals();
      fetchReceipts(currentStatus);
    } catch (err) {
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
    if (receipts.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không có phiếu xuất nào.</div>;

    return (
      <div className="shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Phiếu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map(receipt => {
              const statusInfo = STATUS_CONFIG[receipt.receipt_status] || { text: receipt.receipt_status, className: "bg-gray-100 text-gray-800" };
              return (
                <tr key={receipt.receipt_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{receipt.receipt_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{receipt.created_by?.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{receipt.customer?.customer_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(receipt.total_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(receipt.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold inline-block ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className={btnView} onClick={() => handleViewDetails(receipt)}>Xem</button>
                    {receipt.receipt_status === 'pending' && (
                      <>
                        <button className={btnApprove} onClick={() => handleOpenActionModal(receipt, 'approved')}>Duyệt</button>
                        <button className={btnReject} onClick={() => handleOpenActionModal(receipt, 'rejected')}>Từ chối</button>
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
            <h2 className="text-xl font-semibold">Chi tiết Phiếu xuất #{selectedReceipt.receipt_id}</h2>
            <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {detailLoading ? (
              <div className="p-10 text-center text-lg text-gray-500">Đang tải chi tiết...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>
            ) : detailData ? (
              <>
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">Khách hàng:</strong> {detailData.customer?.customer_name}</p>
                  <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">Địa chỉ:</strong> {detailData.customer?.address}</p>
                  <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">SĐT:</strong> {detailData.customer?.phone}</p>
                  <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">Người tạo:</strong> {detailData.created_by?.full_name}</p>
                  <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">Tổng tiền:</strong> {formatCurrency(detailData.total_amount)}</p>
                  <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">Trạng thái:</strong> {STATUS_CONFIG[detailData.receipt_status].text}</p>
                  {detailData.approval_info && (
                    <>
                      <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">Người duyệt:</strong> {detailData.approval_info.approved_by_name}</p>
                      <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">Ngày duyệt:</strong> {formatDate(detailData.approval_info.approved_at)}</p>
                      <p className="text-sm text-gray-700 mb-1"><strong className="font-medium text-gray-900">Ghi chú:</strong> {detailData.approval_info.reason}</p>
                    </>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-3">Danh sách sản phẩm</h3>
                <div className="shadow rounded-lg overflow-hidden border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.details.map(item => (
                        <tr key={item.product_id}>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.product_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(item.total_amount)}</td>
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
            <h2 className="text-xl font-semibold">Xác nhận {isReject ? 'Từ chối' : 'Duyệt'} Phiếu</h2>
            <button type="button" onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
          </div>
          <div className="p-6">
            <p className="text-base text-gray-700">Bạn có chắc muốn <strong>{isReject ? 'TỪ CHỐI' : 'DUYỆT'}</strong> phiếu xuất <strong>#{selectedReceipt.receipt_id}</strong> không?</p>
            {isReject && (
              <div className="mt-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">Lý do từ chối (bắt buộc):</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Duyệt Phiếu Xuất</h1>
      {renderTabs()}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {renderTable()}
      </div>
      {renderDetailModal()}
      {renderActionModal()}
    </div>
  );
}

export default ApprovalPage;