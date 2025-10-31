import React, { useEffect, useState } from "react";

export default function StockModal({
  open,
  onClose,
  onSave,
  initialData = null,
}) {
  const [form, setForm] = useState({
    quantity: "",
    stock_status: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        quantity: initialData.quantity ?? "",
        stock_status: initialData.stock_status ?? "",
      });
    } else {
      setForm({ quantity: "", stock_status: "" });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      quantity: form.quantity === "" ? null : Number(form.quantity),
      stock_status: form.stock_status,
    };
    onSave(payload);
  };

  // helper to safely read nested product info
  const prod = initialData?.products ?? {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Cập nhật tồn kho</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Tên sản phẩm</label>
            <input
              value={prod.product_name ?? "-"}
              readOnly
              className="w-full bg-gray-100 border rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600">Đơn vị</label>
              <input
                value={prod.unit ?? "-"}
                readOnly
                className="w-full bg-gray-100 border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Tối thiểu</label>
              <input
                value={prod.minimum ?? "-"}
                readOnly
                className="w-full bg-gray-100 border rounded p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600">
              Trạng thái sản phẩm
            </label>
            <input
              value={prod.product_status ?? "-"}
              readOnly
              className="w-full bg-gray-100 border rounded p-2"
            />
          </div>

          <hr className="my-2" />

          <div>
            <label className="block text-sm">Số lượng tồn kho</label>
            <input
              name="quantity"
              value={form.quantity}
              // onChange={handleChange}
              // type="number"
              // step="1"
              className="w-full border rounded p-2"
              // required
            />
          </div>

          <div>
            <label className="block text-sm">Trạng thái kho</label>
            <select
              name="stock_status"
              value={form.stock_status}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="normal">normal</option>
              <option value="damaged">damaged</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
