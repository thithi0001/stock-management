import React, { useEffect, useState } from 'react';
import { createImportReceipt } from '../../services/importService';
// (ĐÃ SỬA) Sửa tên hàm import cho đúng
import { createLink } from '../../services/restockServices';
import { getProducts } from '../../services/productServices';
import { getSuppliers } from '../../services/supplierService';
import { useApi } from '../../services/api';

// --- Helpers ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
const normalizeResponse = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
};

export default function ImportModal({ open, onClose, onCreated, restockRequest }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState([]); // Bắt đầu rỗng
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const api = useApi();
  
  // (MỚI) Xác định xem đây là phiếu tự do (ad-hoc) hay theo yêu cầu
  const isAdHoc = !restockRequest;

  // Load NCC và Sản phẩm
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [supplierRes, productRes] = await Promise.all([
          getSuppliers(api),
          getProducts(api)
        ]);
        if (cancelled) return;
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

  // (CẬP NHẬT) Tự động điền sản phẩm HOẶC tạo dòng trống
  useEffect(() => {
    if (open) { // Chỉ chạy khi modal mở
      if (isAdHoc) {
        // Case 2: Tạo tự do, bắt đầu với 1 dòng rỗng
        setLines([{ product_id: '', quantity: 1, unit_price: 0 }]);
      } else if (restockRequest && products.length > 0) {
        // Case 1: Tạo từ yêu cầu
        const product = products.find(p => p.product_id === restockRequest.product_id);
        setLines([
          {
            product_id: restockRequest.product_id,
            product_name: product?.product_name || 'N/A',
            quantity: restockRequest.requested_quantity || 1,
            unit_price: product?.import_price || 0,
          }
        ]);
      } else if (!restockRequest) {
          setLines([]);
      }
    }
  }, [open, isAdHoc, restockRequest, products]);

  // (THÊM LẠI) Các hàm quản lý dòng (chỉ dùng cho ad-hoc)
  const addLine = () => setLines([...lines, { product_id: '', quantity: 1, unit_price: 0 }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  // (CẬP NHẬT) Hàm updateLine
  const updateLine = (i, patch) => {
    setLines(lines.map((l, idx) => {
      if (idx !== i) return l;
      
      const updatedLine = { ...l, ...patch };
      
      // Nếu là tạo tự do và chọn sản phẩm -> tự điền giá
      if (isAdHoc && patch.product_id) {
        const selected = products.find(p => Number(p.product_id) === Number(patch.product_id));
        if (selected) {
          updatedLine.unit_price = selected.import_price ?? 0;
        }
      }
      return updatedLine;
    }));
  };

  const computeLineTotal = (l) => (Number(l.quantity || 0) * Number(l.unit_price || 0));
  const computeTotal = () => lines.reduce((sum, l) => sum + computeLineTotal(l), 0);

  // (CẬP NHẬT) handleSubmit (thêm điều kiện if (restockRequest))
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

      // 1. Tạo Phiếu Nhập
      const receiptRes = await createImportReceipt(api, finalPayload);
      const newReceiptId = receiptRes?.receipt?.receipt_id;

      if (!newReceiptId) {
        throw new Error("Không nhận được ID phiếu nhập sau khi tạo.");
      }

      // 2. (CẬP NHẬT) Chỉ tạo Link nếu đây là phiếu nhập từ Yêu cầu
      if (restockRequest) {
        await createLink(api, {
          restock_request_id: restockRequest.request_id,
          import_receipt_id: newReceiptId,
          note: `Linked to receipt #${newReceiptId}`
        });
      }
      
      alert(receiptRes.message || "Tạo phiếu nhập thành công!");
      onCreated && onCreated(); 
      onClose(); 
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || 'Lỗi khi tạo phiếu nhập');
    } finally {
      setLoading(false);
    }
  };
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg max-h-[90vh] flex flex-col">
        <h3 className="text-xl font-semibold mb-4">🧾 Tạo phiếu nhập kho</h3>
        
        {/* (CẬP NHẬT) Chỉ hiển thị khi có yêu cầu */}
        {!isAdHoc && (
          <p className="text-sm text-gray-600 mb-2">
            Từ Yêu cầu: <span className="font-medium">#{restockRequest.request_id}</span>
          </p>
        )}

        {error && <div className="text-red-600 mb-2 p-3 bg-red-50 border border-red-200 rounded">{error}</div>}

        <div className="flex-grow overflow-y-auto pr-2">
          {/* Select Nhà cung cấp (Giữ nguyên) */}
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

          {/* Bảng sản phẩm (CẬP NHẬT) */}
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
                    {/* (MỚI) Thêm cột Xóa nếu là ad-hoc */}
                    {isAdHoc && <th className="p-2 w-10"></th>} 
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        {isAdHoc ? (
                          // (MỚI) Case 2: Select sản phẩm
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
                        ) : (
                          // Case 1: Input bị khóa (Từ yêu cầu)
                          <input 
                            type="text" 
                            value={l.product_name}
                            readOnly
                            className="border-0 bg-gray-100 p-1 rounded w-full"
                          />
                        )}
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
                      
                      {/* (MỚI) Nút xóa */}
                      {isAdHoc && (
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeLine(i)}
                            disabled={lines.length === 1}
                            className="text-red-500 font-bold hover:text-red-700 disabled:opacity-30"
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* (MỚI) Nút thêm dòng (chỉ cho ad-hoc) */}
            {isAdHoc && (
              <button
                onClick={addLine}
                className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800"
              >
                + Thêm sản phẩm
              </button>
            )}
          </div>
        </div>

        {/* Footer (Giữ nguyên) */}
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