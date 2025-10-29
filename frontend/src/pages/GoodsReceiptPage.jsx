import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoodsReceiptModal from '../components/modals/GoodsReceiptModal'; // Import modal mới

// Dữ liệu fake: Dùng cấu trúc chi tiết hơn để truyền vào Modal
const fakeApprovedPOs = [
  { 
    id: 2, 
    supplier: "NCC B", 
    createdBy: "staff2", 
    status: "APPROVED",
    products: [
      { id: 101, name: "Sản phẩm X", quantity_requested: 50 },
      { id: 102, name: "Sản phẩm Y", quantity_requested: 120 },
    ]
  },
  { 
    id: 6, 
    supplier: "NCC D", 
    createdBy: "staff1", 
    status: "APPROVED",
    products: [
      { id: 105, name: "Sản phẩm A", quantity_requested: 30 },
    ]
  },
];

// Styles
const styles = {
  container: { padding: '20px' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2' },
  td: { border: '1px solid #ddd', padding: '12px' },
  actionButton: {
    backgroundColor: '#007bff', color: 'white', padding: '5px 10px', 
    border: 'none', borderRadius: '5px', cursor: 'pointer'
  }
};

export default function GoodsReceiptPage() {
  const navigate = useNavigate();
  const [approvedOrders, setApprovedOrders] = useState(fakeApprovedPOs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  // Mở modal và set PO được chọn
  const handleOpenModal = (po) => {
    setSelectedPO(po);
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPO(null);
  };

  // Xử lý logic sau khi xác nhận nhập kho
  const handleConfirmReceiptLogic = (po_id, receivedData) => {
    alert(`Đã tạo Phiếu Nhập Kho (GR) cho PO #${po_id}! Tồn kho đã được cập nhật.`);
    // Cập nhật UI: Xóa PO đã nhập khỏi danh sách
    setApprovedOrders(approvedOrders.filter(po => po.id !== po_id));
    handleCloseModal();
  };
  
  // Xử lý logic sau khi báo cáo lỗi
  const handleReportLogic = (po_id, discrepanciesData) => {
    alert(`Đã tạo Biên bản lỗi cho PO #${po_id}!`);
    // Cập nhật UI: Xóa PO đã xử lý khỏi danh sách
    setApprovedOrders(approvedOrders.filter(po => po.id !== po_id));
    handleCloseModal();
    navigate('/reports'); // Chuyển đến trang báo cáo
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Tạo Phiếu Nhập Kho (Goods Receipt)</h2>
      <p>Danh sách các Phiếu yêu cầu (PO) đã được duyệt và chờ nhập kho.</p>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>PO ID</th>
            <th style={styles.th}>Nhà cung cấp</th>
            <th style={styles.th}>Người tạo</th>
            <th style={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {approvedOrders.map((order) => (
            <tr key={order.id}>
              <td style={styles.td}>{order.id}</td>
              <td style={styles.td}>{order.supplier}</td>
              <td style={styles.td}>{order.createdBy}</td>
              <td style={styles.td}>
                <button 
                  style={styles.actionButton}
                  onClick={() => handleOpenModal(order)} // Mở modal khi click
                >
                  Tiến hành Nhập kho
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Render Modal nếu isModalOpen là true và có PO được chọn */}
      {isModalOpen && selectedPO && (
        <GoodsReceiptModal
          po={selectedPO}
          onClose={handleCloseModal}
          onConfirm={handleConfirmReceiptLogic}
          onReport={handleReportLogic}
        />
      )}
    </div>
  );
}