import React, { useEffect, useState } from 'react';
import { createImportReceipt } from '../../services/importService';
import { useApi } from '../../services/api';
import { getSuppliers } from '../../services/supplierService';
import { getProducts } from '../../services/productServices';
import { toast } from 'react-toastify';

// --- Helpers ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Helper này đã được cập nhật để xử lý cả mảng (products) và object có phân trang (suppliers)
const normalizeResponse = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res; // Dùng cho getProducts
  if (res.data && Array.isArray(res.data)) return res.data; 
  if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data; // Dùng cho getSuppliers
  return [];
};

// --- Component Modal Tạo Phiếu Nhập ---
export default function ImportModal({ open, onClose, onCreated }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const api = useApi();

  // Load Nhà cung cấp và Sản phẩm khi modal mở
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [supplierRes, productRes] = await Promise.all([
          getSuppliers(api), // service trả về { data: { data: [...] } }
          getProducts(api)   // service trả về [...]
        ]);
        if (cancelled) return;
        
        // Dùng normalizeResponse cho cả hai
        setSuppliers(normalizeResponse(supplierRes)); 
        setProducts(normalizeResponse(productRes));
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Không thể tải danh sách NCC hoặc sản phẩm");
      } finally {
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, api]);

  // --- Quản lý Dòng sản phẩm ---
  const addLine = () => setLines([...lines, { product_id: '', quantity: 1, unit_price: 0 }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  const updateLine = (i, patch) => {
    setLines(lines.map((l, idx) => {
      if (idx !== i) return l;
      
      const updatedLine = { ...l, ...patch };
      
      // Tự động điền giá nhập khi chọn sản phẩm
      if (patch.product_id) {
        const selected = products.find(p => Number(p.product_id) === Number(patch.product_id));
        if (selected) {
          // QUAN TRỌNG: Dùng giá NHẬP (import_price)
          updatedLine.unit_price = selected.import_price ?? 0;
        }
      }
      return updatedLine;
    }));
  };

  const computeLineTotal = (l) => (Number(l.quantity || 0) * Number(l.unit_price || 0));
  const computeTotal = () => lines.reduce((sum, l) => sum + computeLineTotal(l), 0);

  // --- Xử lý Submit ---
  const handleSubmit = async () => {
    setError('');
    if (!supplierId) return setError('⚠️ Vui lòng chọn nhà cung cấp');
    if (!lines.every(l => l.product_id && l.quantity > 0)) return setError('⚠️ Điền đầy đủ thông tin sản phẩm');
    if (!window.confirm('Xác nhận tạo phiếu nhập này?')) return;

    setLoading(true);
    try {
      const total_amount = computeTotal();

      const payloadDetails = lines.map(l => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
        total_amount: computeLineTotal(l)
      }));

      const finalPayload = {
        supplier_id: Number(supplierId),
        total_amount: total_amount,
        details: payloadDetails 
      };

      const res = await createImportReceipt(api, finalPayload);
      
      toast.success(res?.message || "Tạo phiếu nhập thành công!");
      onCreated && onCreated(); 
      onClose(); 
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || 'Lỗi khi tạo phiếu nhập');
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!open) return null;

  // --- JSX ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg max-h-[90vh] flex flex-col">
        <h3 className="text-xl font-semibold mb-4">🧾 Tạo phiếu nhập kho</h3>

        {error && <div className="text-red-600 mb-2 p-3 bg-red-50 border border-red-200 rounded">{error}</div>}

        <div className="flex-grow overflow-y-auto pr-2">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nhà cung cấp</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="border p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers.map(s => (
                  <option key={s.supplier_id} value={s.supplier_id}>
                      {`${s.supplier_name} — [ID: ${s.supplier_id}]${s.phone ? ' | ' + s.phone : ''}`}
                  </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Danh sách sản phẩm</label>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left w-1/3">Sản phẩm</th>
                    <th className="p-2 text-center w-1/6">Số lượng</th>
                    <th className="p-2 text-center w-1/6">Đơn giá (nhập)</th>
                    <th className="p-2 text-center w-1/6">Thành tiền</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        <select
                          className="border p-1 rounded w-full"
                          value={l.product_id}
                          onChange={(e) => updateLine(i, { product_id: e.target.value })}
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map(p => (
                              <option key={p.product_id} value={p.product_id}>
                                  {`${p.product_name} — [${p.unit ?? 'đv'}]`}
                              </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          className="border p-1 rounded w-20 text-center"
                          value={l.quantity}
                          onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="border p-1 rounded w-24 text-center"
                          value={l.unit_price}
                          onChange={(e) => updateLine(i, { unit_price: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-2 text-right font-medium">{formatCurrency(computeLineTotal(l))}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeLine(i)}
                          disabled={lines.length === 1}
                          className="text-red-500 font-bold hover:text-red-700 disabled:opacity-30"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={addLine}
              className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              + Thêm sản phẩm
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex justify-between items-center">
          <div className="text-lg font-semibold">
            Tổng cộng: <span className="text-blue-700">{formatCurrency(computeTotal())}</span>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 border rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
              onClick={onClose}
              disabled={loading}
            >
              Huỷ
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700 disabled:bg-blue-300"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Lưu phiếu nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}