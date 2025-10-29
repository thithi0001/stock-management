import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Dữ liệu fake cho sản phẩm và nhà cung cấp
const fakeSuppliers = [
  { id: 1, name: "NCC A" },
  { id: 2, name: "NCC B" },
  { id: 3, name: "NCC C" },
];
const fakeProducts = [
  { id: 101, name: "Sản phẩm X" },
  { id: 102, name: "Sản phẩm Y" },
  { id: 103, name: "Sản phẩm Z" },
];

// Styles
const styles = {
  container: { padding: '20px', maxWidth: '800px' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '5px', fontWeight: 'bold' },
  select: { padding: '10px', fontSize: '16px' },
  input: { padding: '10px', fontSize: '16px' },
  productItem: {
    display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px'
  },
  button: {
    backgroundColor: '#007bff', color: 'white', padding: '7px 20px',
    border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px',
    alignSelf: 'flex-start'
  },
  addProductButton: {
    backgroundColor: '#28a745',
    width: '180px'
  },
  submitButton: {
    backgroundColor: '#007bff',
    width: '200px',
  }
};

export default function CreatePOPage() {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState('');
  const [products, setProducts] = useState([{ product_id: '', quantity: 1 }]);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { product_id: '', quantity: 1 }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic gửi dữ liệu
    console.log({ supplier, products });
    alert('Đã tạo Phiếu yêu cầu nhập hàng mới!');
    navigate('/import');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Tạo Phiếu Yêu Cầu Nhập Hàng (PO)</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Chọn Nhà cung cấp:</label>
          <select
            style={styles.select}
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
          >
            <option value="">-- Chọn NCC --</option>
            {fakeSuppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Chi tiết Sản phẩm:</label>
          {products.map((p, index) => (
            <div key={index} style={styles.productItem}>
              <select
                style={{ ...styles.select, flex: 2 }}
                value={p.product_id}
                onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                required
              >
                <option value="">-- Chọn Sản phẩm --</option>
                {fakeProducts.map(fp => (
                  <option key={fp.id} value={fp.id}>{fp.name}</option>
                ))}
              </select>
              <input
                type="number"
                style={{ ...styles.input, flex: 1 }}
                placeholder="Số lượng"
                value={p.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                min="1"
                required
              />
            </div>
          ))}
          <div style={{ width: '100%', textAlign: 'right' }}>
            <button
              type="button"
              onClick={addProduct}
              style={{ ...styles.button, ...styles.addProductButton, whiteSpace: 'nowrap' }}
            >
              + Thêm Sản phẩm
            </button> 
          </div>
        </div>

        <button type="submit" style={{ ...styles.button, ...styles.submitButton }}>
          Gửi Yêu cầu
        </button>
      </form>
    </div>
  );
}