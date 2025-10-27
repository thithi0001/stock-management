import React, { useState } from 'react';

// Styles cho Modal
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '20px',
    fontSize: '28px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  title: { fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' },
  subTitle: { fontSize: '16px', color: '#555', marginBottom: '20px' },
  detailGroup: { marginBottom: '15px' },
  label: { fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { border: '1px solid #ddd', padding: '10px', backgroundColor: '#f2f2f2' },
  td: { border: '1px solid #ddd', padding: '10px' },
  actionArea: { marginTop: '30px', display: 'flex', gap: '15px' },
  button: {
    padding: '10px 20px', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontSize: '16px',
    color: 'white'
  },
  approveButton: { backgroundColor: '#28a745' },
  rejectButton: { backgroundColor: '#dc3545' },
  reasonInput: { width: '100%', padding: '10px', fontSize: '16px', marginTop: '10px', minHeight: '80px' }
};

// Component con để render chi tiết (vì mỗi loại yêu cầu có chi tiết khác nhau)
const RequestDetails = ({ request }) => {
  const { type, details } = request;

  if (type === 'import') {
    return (
      <>
        <div style={modalStyles.detailGroup}>
          <span style={modalStyles.label}>Nhà cung cấp: </span>{details.supplier}
        </div>
        <h4 style={{...modalStyles.title, fontSize: '18px', marginTop: '20px'}}>Chi tiết sản phẩm nhập:</h4>
        <table style={modalStyles.table}>
          <thead>
            <tr>
              <th style={modalStyles.th}>ID</th>
              <th style={modalStyles.th}>Tên Sản phẩm</th>
              <th style={modalStyles.th}>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {details.products.map(p => (
              <tr key={p.id}>
                <td style={modalStyles.td}>{p.id}</td>
                <td style={modalStyles.td}>{p.name}</td>
                <td style={modalStyles.td}>{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  if (type === 'export') {
    return (
      <>
        <div style={modalStyles.detailGroup}>
          <span style={modalStyles.label}>Khách hàng: </span>{details.customer}
        </div>
         <h4 style={{...modalStyles.title, fontSize: '18px', marginTop: '20px'}}>Chi tiết sản phẩm xuất:</h4>
        {/* ... (Tương tự bảng cho sản phẩm xuất) ... */}
      </>
    );
  }
  
  if (type === 'other') {
     return (
      <>
        <div style={modalStyles.detailGroup}>
          <span style={modalStyles.label}>Lý do: </span>{details.reason}
        </div>
        <div style={modalStyles.detailGroup}>
          <span style={modalStyles.label}>Từ ngày: </span>{details.from}
        </div>
        <div style={modalStyles.detailGroup}>
          <span style={modalStyles.label}>Đến ngày: </span>{details.to}
        </div>
      </>
    );
  }

  return <p>Không có chi tiết cho loại yêu cầu này.</p>;
};

export default function ApprovalDetailModal({ request, onClose, onApprove, onReject }) {
  const [reason, setReason] = useState('');
  const [showReason, setShowReason] = useState(false);

  const handleInternalApprove = () => {
    onApprove(request.id);
  };

  const handleInternalReject = () => {
    // Hàm onReject sẽ kiểm tra 'reason' và return true/false
    const success = onReject(request.id, reason);
    if (!success) {
        // Nếu onReject trả về false (do thiếu reason), giữ modal mở
        setShowReason(true); 
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <span style={modalStyles.closeButton} onClick={onClose}>&times;</span>
        
        <h2 style={modalStyles.title}>Chi tiết Yêu cầu Duyệt</h2>
        <h3 style={modalStyles.subTitle}>#{request.id} - {request.title}</h3>

        <div style={modalStyles.detailGroup}>
          <span style={modalStyles.label}>Người tạo: </span>{request.createdBy}
        </div>
        <div style={modalStyles.detailGroup}>
          <span style={modalStyles.label}>Trạng thái: </span>{request.status}
        </div>

        <hr style={{margin: '20px 0'}} />

        {/* Render chi tiết động */}
        <RequestDetails request={request} />
        
        <hr style={{margin: '20px 0'}} />

        {/* Khu vực duyệt */}
        <div style={modalStyles.actionArea}>
          <button 
            style={{...modalStyles.button, ...modalStyles.approveButton}} 
            onClick={handleInternalApprove}
          >
            Phê duyệt
          </button>
          <button 
            style={{...modalStyles.button, ...modalStyles.rejectButton}}
            onClick={() => setShowReason(true)}
          >
            Từ chối
          </button>
        </div>

        {showReason && (
          <div style={{marginTop: '20px'}}>
            <label style={modalStyles.label}>Lý do từ chối:</label>
            <textarea
              style={modalStyles.reasonInput}
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
            />
            <button 
              style={{...modalStyles.button, ...modalStyles.rejectButton, marginTop: '10px'}}
              onClick={handleInternalReject}
            >
              Xác nhận Từ chối
            </button>
          </div>
        )}

      </div>
    </div>
  );
}