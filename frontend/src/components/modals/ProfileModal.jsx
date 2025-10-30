import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ProfileModal({
  open,
  onClose,
  onSave,
  initialData = {},
}) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        full_name: initialData.full_name ?? "",
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
      });
    } else {
      setForm({ full_name: "", phone: "", email: "" });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!form.full_name?.trim())
      return toast.warn("Họ và tên không được để trống");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      return toast.warn("Email không hợp lệ");

    setLoading(true);
    try {
      // onSave may be sync or async; ensure Promise
      await Promise.resolve(
        onSave({
          full_name: form.full_name,
          phone: form.phone || null,
          email: form.email || null,
        })
      );
      // parent closes modal (or we can close here)
    } catch (err) {
      // error already handled by parent in most cases; show fallback
      const msg =
        err?.response?.data?.message || err?.message || "Lỗi khi lưu thông tin";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Sửa thông tin</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Họ và tên</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Số điện thoại</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded p-2"
              inputMode="tel"
            />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded p-2"
              type="email"
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
