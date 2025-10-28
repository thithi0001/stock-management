import React, { useEffect, useState } from 'react';
// 1. CHỈ IMPORT 'createExportReceipt'
import { createExportReceipt } from '../../services/exportService';
import { useApi } from '../../services/api';
import { getCustomers } from '../../services/customerServices';
import { getProducts } from '../../services/productServices';

function normalizeResponse(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}

export default function ExportModal({ open, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const api = useApi();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        const [customerRes, productRes] = await Promise.all([
          getCustomers(api),
          getProducts(api)
        ]);
        if (cancelled) return;
        setCustomers(normalizeResponse(customerRes));
        setProducts(normalizeResponse(productRes));
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      }
    })();

    return () => { cancelled = true; };
  }, [open, api]);

  const addLine = () => setLines([...lines, { product_id: '', quantity: 1, unit_price: 0 }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  const updateLine = (i, patch) => {
    setLines(lines.map((l, idx) => {
      if (idx !== i) return l;
      if (patch.product_id) {
        const selected = products.find(p => Number(p.product_id) === Number(patch.product_id));
        if (selected) patch.unit_price = selected.export_price ?? selected.exportPrice ?? 0;
      }
      return { ...l, ...patch };
    }));
  };

  const computeLineTotal = (l) => (Number(l.quantity || 0) * Number(l.unit_price || 0));
  const computeTotal = () => lines.reduce((sum, l) => sum + computeLineTotal(l), 0);

  /**
   * (ĐÃ CẬP NHẬT)
   * Gửi tất cả dữ liệu trong 1 payload duy nhất
   */
  const handleSubmit = async () => {
    setError('');
    if (!customerId) return setError('⚠️ Vui lòng chọn khách hàng');
    if (!lines.every(l => l.product_id && l.quantity > 0)) return setError('⚠️ Điền đầy đủ thông tin sản phẩm');
    if (!window.confirm('Xác nhận tạo phiếu xuất này?')) return;

    setLoading(true);
    try {
      const total_amount = computeTotal();

      // 1. Chuẩn bị chi tiết payload
      const payloadDetails = lines.map(l => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
        total_amount: computeLineTotal(l)
      }));

      // 2. Chuẩn bị payload tổng
      const finalPayload = {
        customer_id: Number(customerId),
        total_amount: total_amount,
        details: payloadDetails // Gửi mảng chi tiết CÙNG LÚC
      };

      // 3. Gọi 1 API duy nhất
      const res = await createExportReceipt(api, finalPayload);

      // Lấy ID từ response (backend trả về { message, receipt })
      const newReceiptId = res?.receipt?.receipt_id;

      // 4. KHÔNG CÒN LỆNH addExportDetails
      
      onCreated && onCreated({ receipt_id: newReceiptId });
      onClose();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || 'Lỗi khi tạo phiếu xuất');
    } finally {
      setLoading(false);
    }
  };
  
  // Phần JSX (Giao diện) giữ nguyên, nó đã dùng Tailwind
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg max-h-[90vh] flex flex-col">
        <h3 className="text-xl font-semibold mb-4">🧾 Tạo phiếu xuất kho</h3>

        {error && <div className="text-red-600 mb-2 p-3 bg-red-50 border border-red-200 rounded">{error}</div>}

        <div className="flex-grow overflow-y-auto pr-2">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Khách hàng</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="border p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map(c => (
                  <option key={c.customer_id ?? c.id} value={c.customer_id ?? c.id}>
                      {`${c.customer_name ?? c.name ?? '-'} — [ID: ${c.customer_id ?? c.id}]${c.phone ? ' | ' + c.phone : ''}`}
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
                    <th className="p-2 text-center w-1/6">Đơn giá</th>
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
                              <option key={p.product_id ?? p.id} value={p.product_id ?? p.id}>
                                  {`${p.product_name ?? p.name} — [${p.unit ?? 'đv'}]`}
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
              {loading ? 'Đang tạo...' : 'Lưu phiếu xuất'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Thêm helpers
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};