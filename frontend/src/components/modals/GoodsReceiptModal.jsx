import React, { useState } from 'react';

// Dùng lại styles của modal trước cho nhất quán
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
    maxWidth: '800px', // Rộng hơn modal duyệt
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
  // Lấy style từ code của bạn
  title: { fontSize: '24px', fontWeight: 'bold' },
  subTitle: { fontSize: '18px', color: '#555', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2' },
  td: { border: '1px solid #ddd', padding: '12px' },
  input: { padding: '8px', fontSize: '16px', width: '100px' },
  button: {
    padding: '12px 25px', border: 'none', borderRadius: '5px', 
    cursor: 'pointer', fontSize: '16px', color: 'white',
    marginTop: '30px'
  },
  confirmButton: { backgroundColor: '#28a745' },
  reportButton: { backgroundColor: '#dc3545', marginLeft: '15px' }
};


// Lấy logic từ CreateGoodsReceiptPage và chuyển thành Modal
export default function GoodsReceiptModal({ po, onClose, onConfirm, onReport }) {

  // State nội bộ của Modal, khởi tạo từ prop 'po'
  const [receivedProducts, setReceivedProducts] = useState(
    po.products.map(p => ({ ...p, quantity_received: p.quantity_requested }))
  );

  const handleQuantityChange = (productId, value) => {
    setReceivedProducts(
      receivedProducts.map(p => 
        p.id === productId ? { ...p, quantity_received: parseInt(value, 10) || 0 } : p
      )
    );
  };

  const hasDiscrepancy = receivedProducts.some(
    p => p.quantity_received < p.quantity_requested
  );

  // Gọi hàm onConfirm từ cha
  const handleConfirmReceipt = () => {
    console.log("Creating Goods Receipt:", receivedProducts);
    onConfirm(po.id, receivedProducts); // Gửi dữ liệu về cho cha xử lý
  };
  
  // Gọi hàm onReport từ cha
  const handleCreateReport = () => {
    const discrepancies = receivedProducts.filter(
      p => p.quantity_received < p.quantity_requested
    );
    console.log("Creating Defective Report:", discrepancies);
    onReport(po.id, discrepancies); // Gửi dữ liệu về cho cha xử lý
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <span style={modalStyles.closeButton} onClick={onClose}>&times;</span>

        <h2 style={modalStyles.title}>Xác nhận Nhập kho (Tạo GR)</h2>
        <h3 style={modalStyles.subTitle}>Từ Phiếu yêu cầu (PO) #{po.id} - {po.supplier}</h3>
        
        <p>Vui lòng điền số lượng thực nhận từ nhà cung cấp:</p>

        <table style={modalStyles.table}>
          <thead>
            <tr>
              <th style={modalStyles.th}>Sản phẩm</th>
              <th style={modalStyles.th}>Số lượng Yêu cầu</th>
              <th style={modalStyles.th}>Số lượng Thực nhận</th>
            </tr>
          </thead>
          <tbody>
            {receivedProducts.map((p) => (
              <tr key={p.id}>
                <td style={modalStyles.td}>{p.name} (ID: {p.id})</td>
                <td style={modalStyles.td}>{p.quantity_requested}</td>
                <td style={modalStyles.td}>
                  <input
                    type="number"
                    style={{
                      ...modalStyles.input, 
                      borderColor: p.quantity_received < p.quantity_requested ? 'red' : 'green',
                      borderWidth: '2px'
                    }}
                    value={p.quantity_received}
                    onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                    max={p.quantity_requested}
                    min="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button 
          style={{...modalStyles.button, ...modalStyles.confirmButton}}
          onClick={handleConfirmReceipt}
        >
          Xác nhận Nhập kho
        </button>

        {hasDiscrepancy && (
          <button 
            style={{...modalStyles.button, ...modalStyles.reportButton}}
            onClick={handleCreateReport}
          >
            Lập Biên bản Lỗi (Hàng thiếu/hỏng)
          </button>
        )}
      </div>
    </div>
  );
}