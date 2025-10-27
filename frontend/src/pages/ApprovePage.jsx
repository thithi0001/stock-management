import React, { useState } from 'react';
import ApprovalDetailModal from '../components/modals/ApprovalDetailModal'; // Component mới sẽ tạo ở bước 2

// Dữ liệu fake mới: Danh sách nhiều loại yêu cầu
const fakeRequests = [
  { 
    id: 1, 
    type: 'import', 
    title: 'Yêu cầu Nhập kho #1 (PO-001)', 
    createdBy: 'staff_import_1', 
    createdAt: 'staff_import_1',
    status: 'PENDING',
    details: {
      supplier: "NCC A",
      products: [
        { id: 101, name: "Sản phẩm X", quantity: 50 },
        { id: 103, name: "Sản phẩm Z", quantity: 100 },
      ]
    }
  },
  { 
    id: 2, 
    type: 'export', 
    title: 'Yêu cầu Xuất kho #2 (SO-001)', 
    createdBy: 'staff_export_1', 
    createdAt: '2025-10-25 10:00',
    status: 'PENDING',
    details: {
      customer: "Khách hàng B",
      products: [
        { id: 102, name: "Sản phẩm Y", quantity: 20 },
      ]
    }
  },
  { 
    id: 3, 
    type: 'other', 
    title: 'Yêu cầu nghỉ phép', 
    createdBy: 'storekeeper_1', 
    createdAt: '2025-10-25 10:00',
    status: 'PENDING',
    details: {
      reason: "Nghỉ ốm đột xuất",
      from: "2025-10-28",
      to: "2025-10-29"
    }
  },
    { 
    id: 4, 
    type: 'import', 
    title: 'Yêu cầu Nhập kho #4 (PO-002)', 
    createdBy: 'staff_import_2', 
    createdAt: '2025-10-25 10:00',
    status: 'APPROVED',
    details: { /* ... */ }
  },
];

// Styles
const styles = {
  container: { padding: '20px', maxWidth: '1000px' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2' },
  td: { border: '1px solid #ddd', padding: '12px' },
  actionButton: {
    backgroundColor: '#007bff', color: 'white', padding: '5px 10px', 
    border: 'none', borderRadius: '5px', cursor: 'pointer'
  },
};

export default function ApprovalPage() {
  const [requests, setRequests] = useState(fakeRequests.filter(r => r.status === 'PENDING'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  // Hàm xử lý khi duyệt, truyền vào Modal
  const handleApprove = (id) => {
    alert(`Đã phê duyệt yêu cầu #${id}!`);
    // Cập nhật lại UI: Lọc bỏ yêu cầu đã duyệt
    setRequests(requests.filter(r => r.id !== id));
    handleCloseModal();
  };

  // Hàm xử lý khi từ chối, truyền vào Modal
  const handleReject = (id, reason) => {
    if (!reason) {
      alert('Vui lòng nhập lý do từ chối.');
      return false; // Báo hiệu cho Modal không đóng
    }
    alert(`Đã từ chối yêu cầu #${id} với lý do: ${reason}`);
    // Cập nhật lại UI: Lọc bỏ yêu cầu đã từ chối
    setRequests(requests.filter(r => r.id !== id));
    handleCloseModal();
    return true; // Báo hiệu cho Modal đóng
  };
  
  const getStatusStyle = (status) => {
    let color = status === 'PENDING' ? '#ffc107' : '#28a745';
    return {
      padding: '5px 10px',
      borderRadius: '15px',
      color: 'white',
      backgroundColor: color,
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block'
    };
  };
  
  const getTypeLabel = (type) => {
    if (type === 'import') return 'Nhập kho';
    if (type === 'export') return 'Xuất kho';
    return 'Khác';
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Danh sách Yêu cầu chờ Duyệt</h2>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Tiêu đề</th>
            <th style={styles.th}>Loại Yêu cầu</th>
            <th style={styles.th}>Người tạo</th>
            <th style={styles.th}>Ngày tạo</th>
            <th style={styles.th}>Trạng thái</th>
            <th style={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td style={styles.td}>{req.id}</td>
              <td style={styles.td}>{req.title}</td>
              <td style={styles.td}>{getTypeLabel(req.type)}</td>
              <td style={styles.td}>{req.createdBy}</td>
              <td style={styles.td}>{req.createdAt}</td>
              <td style={styles.td}><span style={getStatusStyle(req.status)}>{req.status}</span></td>
              <td style={styles.td}>
                <button 
                  style={styles.actionButton}
                  onClick={() => handleViewDetails(req)}
                >
                  Xem & Duyệt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Render Modal nếu isModalOpen là true */}
      {isModalOpen && (
        <ApprovalDetailModal
          request={selectedRequest}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}