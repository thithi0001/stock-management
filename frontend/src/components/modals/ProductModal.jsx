import React, { useEffect, useState } from "react";

export default function ProductModal({ open, onClose, onSave, initialData = null }) {
  const [form, setForm] = useState({
    product_name: "",
    unit: "",
    import_price: "",
    export_price: "",
    minimum: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        product_name: initialData.product_name ?? "",
        unit: initialData.unit ?? "",
        import_price: initialData.import_price ?? "",
        export_price: initialData.export_price ?? "",
        minimum: initialData.minimum ?? ""
      });
    } else {
      setForm({
        product_name: "",
        unit: "",
        import_price: "",
        export_price: "",
        minimum: ""
      });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product_name.trim()) {
      return alert("Tên sản phẩm là bắt buộc");
    }
    // convert numeric fields
    const payload = {
      ...form,
      import_price: form.import_price === "" ? null : Number(form.import_price),
      export_price: form.export_price === "" ? null : Number(form.export_price),
      minimum: form.minimum === "" ? null : Number(form.minimum)
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{initialData ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Tên sản phẩm</label>
            <input name="product_name" value={form.product_name} onChange={handleChange}
              className="w-full border rounded p-2" required/>
          </div>
          <div>
            <label className="block text-sm">Đơn vị</label>
            <input name="unit" value={form.unit} onChange={handleChange}
              className="w-full border rounded p-2" required/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Giá nhập</label>
              <input name="import_price" value={form.import_price} onChange={handleChange} type="number" step="0.01"
                className="w-full border rounded p-2" required/>
            </div>
            <div>
              <label className="block text-sm">Giá xuất</label>
              <input name="export_price" value={form.export_price} onChange={handleChange} type="number" step="0.01"
                className="w-full border rounded p-2" required/>
            </div>
          </div>
          <div>
            <label className="block text-sm">Tối thiểu</label>
            <input name="minimum" value={form.minimum} onChange={handleChange} type="number"
              className="w-full border rounded p-2" required/>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}