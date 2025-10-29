import React, { useEffect, useState } from "react";

export default function ProductModal({
  open,
  onClose,
  onSave,
  initialData = null,
}) {
  const [form, setForm] = useState({
    product_name: "",
    unit: "",
    import_price: "",
    export_price: "",
    minimum: "",
    product_status: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        product_name: initialData.product_name ?? "",
        unit: initialData.unit ?? "",
        import_price: initialData.import_price ?? "",
        export_price: initialData.export_price ?? "",
        minimum: initialData.minimum ?? "",
        product_status: initialData.product_status ?? "",
      });
    } else {
      setForm({
        product_name: "",
        unit: "",
        import_price: "",
        export_price: "",
        minimum: "",
        product_status: "",
      });
    }
  }, [initialData, open]);

  if (!open) return null;

  // chặn các ký tự không hợp lệ khi gõ
  const preventInvalidNumberKeys = (e, allowDecimal = false) => {
    const invalid = ["e", "E", "+", "-"];
    if (invalid.includes(e.key)) e.preventDefault();
    if (!allowDecimal && e.key === ".") e.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // minimum: chỉ cho phép chữ số nguyên không âm
    if (name === "minimum") {
      const cleaned = value === "" ? "" : value.replace(/[^0-9]/g, "");
      setForm((s) => ({ ...s, [name]: cleaned }));
      return;
    }

    if (name === "import_price" || name === "export_price") {
      let cleaned = value === "" ? "" : value.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");
      // hạn chế 2 chữ số thập phân
      if (cleaned.includes(".")) {
        const [intPart, decPart] = cleaned.split(".");
        cleaned = intPart + "." + decPart.slice(0, 2);
      }
      setForm((s) => ({ ...s, [name]: cleaned }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product_name.trim()) {
      return alert("Tên sản phẩm là bắt buộc");
    }

    // kiểm tra số hợp lệ
    if (form.minimum !== "" && !/^\d+$/.test(form.minimum)) {
      return alert("Tối thiểu phải là số nguyên không âm");
    }
    if (form.import_price !== "" && isNaN(Number(form.import_price))) {
      return alert("Giá nhập không hợp lệ");
    }
    if (form.export_price !== "" && isNaN(Number(form.export_price))) {
      return alert("Giá xuất không hợp lệ");
    }

    // convert numeric fields
    const payload = {
      ...form,
      import_price: form.import_price === "" ? null : Number(form.import_price),
      export_price: form.export_price === "" ? null : Number(form.export_price),
      minimum: form.minimum === "" ? null : Number(form.minimum),
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {initialData ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Tên sản phẩm</label>
            <input
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Đơn vị</label>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Giá nhập</label>
              <input
                name="import_price"
                value={form.import_price}
                onKeyDown={(e) => preventInvalidNumberKeys(e, true)}
                onChange={handleChange}
                type="number"
                step="0.01"
                className="w-full border rounded p-2"
                required
                />
            </div>
            <div>
              <label className="block text-sm">Giá xuất</label>
              <input
                name="export_price"
                value={form.export_price}
                onKeyDown={(e) => preventInvalidNumberKeys(e, true)}
                onChange={handleChange}
                type="number"
                step="0.01"
                className="w-full border rounded p-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm">Tối thiểu</label>
            <input
              name="minimum"
              value={form.minimum}
              onChange={handleChange}
              type="number"
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Trạng thái</label>
            <select
              name="product_status"
              value={form.product_status}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="available">available</option>
              <option value="unavailable">unavailable</option>
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
