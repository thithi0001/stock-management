import React, { useState } from "react";
import { toast } from "react-toastify";

export default function ChangePasswordModal({
  open,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const { currentPassword, newPassword, confirmPassword } = form;
    if (!currentPassword || !newPassword)
      return toast.warn("Nhập mật khẩu hiện tại và mật khẩu mới");
    if (newPassword.length < 6)
      return toast.warn("Mật khẩu mới tối thiểu 6 ký tự");
    if (newPassword !== confirmPassword)
      return toast.warn("Mật khẩu xác nhận không khớp");

    setLoading(true);
    try {
      await Promise.resolve(onSave({ currentPassword, newPassword }));
      // parent handles success toast; close here for UX
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Lỗi khi đổi mật khẩu";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Mật khẩu hiện tại</label>
            <input
              name="currentPassword"
              value={form.currentPassword}
              onChange={onChange}
              type="password"
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Mật khẩu mới</label>
            <input
              name="newPassword"
              value={form.newPassword}
              onChange={onChange}
              type="password"
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Xác nhận mật khẩu mới</label>
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              type="password"
              className="w-full border rounded p-2"
              required
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
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
