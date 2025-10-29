import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useApi from "../../services/api";
import { getProducts } from "../../services/productServices";

export default function RestockModal({
  open,
  onClose,
  onSave,
  initialData = null,
  notifiedUsers = [],
  loadingUsers = false
}) {
  const { user } = useAuth();
  const api = useApi();
  const [form, setForm] = useState({
    product_id: "",
    requested_quantity: "",
    notified_to: "",
    note: "",
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        product_id: initialData.product_id ?? "",
        requested_quantity: initialData.requested_quantity ?? "",
        notified_to: initialData.notified_to ?? "",
        note: initialData.note ?? "",
      });
    } else {
      setForm({
        product_id: "",
        requested_quantity: "",
        notified_to: "",
        note: "",
      });
    }
  }, [initialData, open]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingProducts(true);
        const data = await getProducts(api);
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch products error", error);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, api]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "requested_quantity") {
      const cleaned = value === "" ? "" : value.replace(/[^0-9]/g, "");
      setForm((s) => ({ ...s, [name]: cleaned }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.product_id.trim()) {
      return alert("Id hàng là bắt buộc");
    }

    if (
      form.requested_quantity !== "" &&
      !/^\d+$/.test(form.requested_quantity)
    ) {
      return alert("Số lượng yêu cầu phải là số nguyên không âm");
    }

    const payload = {
      product_id: form.product_id,
      requested_quantity:
        form.requested_quantity === "" ? null : Number(form.requested_quantity),
      requested_by: user.user_id,
      notified_to: form.notified_to,
      note: form.note,
    };
    onSave(payload);
  };

  // helper to safely read nested product info
  const prod = initialData?.products ?? {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Tạo yêu cầu nhập hàng</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Tên hàng (hiện tại là ID)</label>
            <select
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="">-- Chọn hàng --</option>
              {loadingProducts ? (
                <option disabled>Đang tải...</option>
              ) : (
                products.map((u) => (
                  <option key={u.product_id} value={u.product_id}>
                    {u.product_name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm">Người nhận yêu cầu</label>
            <select
              name="notified_to"
              value={form.notified_to}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="">-- Chọn người nhận --</option>
              {loadingUsers ? (
                <option disabled>Đang tải...</option>
              ) : (
                (notifiedUsers || []).map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm">Số lượng yêu cầu</label>
            <input
              name="requested_quantity"
              value={form.requested_quantity}
              onChange={handleChange}
              type="number"
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm">Ghi chú</label>
            <input
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
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
