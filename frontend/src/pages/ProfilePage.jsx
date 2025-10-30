import React, { useEffect, useState } from "react";
import { useApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ProfileModal from "../components/modals/ProfileModal";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import { changePassword, updateProfile } from "../services/auth";
import { useRefresh } from "../context/RefreshContext";

const ProfilePage = () => {
  const api = useApi();
  const { refreshKey, triggerRefresh } = useRefresh();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [profile, setProfile] = useState({
    user_id: null,
    username: "",
    full_name: "",
    phone: "",
    email: "",
    role: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile((p) => ({
      ...p,
      user_id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    }));
  }, [user, refreshKey]);

  // onSave passed to ProfileModal
  const handleProfileSave = async (data) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await updateProfile(api, user.username, data);
      const updated = res?.data?.data ?? res?.data ?? null;
      toast.success("Cập nhật thông tin thành công");
      if (updated) setProfile((s) => ({ ...s, ...updated }));
      try {
        const stored = JSON.parse(localStorage.getItem("user") ||"{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, ...data }));
      } catch {}
      setShowEditModal(false);
      triggerRefresh();
      return updated;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi khi cập nhật thông tin";
      toast.error(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // onSave passed to ChangePasswordModal
  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    if (changingPwd) return;
    setChangingPwd(true);
    try {
      await changePassword(api, user.username, currentPassword, newPassword);
      toast.success("Đổi mật khẩu thành công");
      setShowPwdModal(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi khi đổi mật khẩu";
      toast.error(msg);
      throw err;
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Hồ sơ của tôi</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="px-3 py-2 border rounded">
            Sửa thông tin
          </button>
          <button onClick={() => setShowPwdModal(true)} className="px-3 py-2 border rounded">
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="space-y-3">
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Tên tài khoản</label>
              <div className="p-2 bg-gray-50 rounded">{profile.username ?? "-"}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Vai trò</label>
              <div className="p-2 bg-gray-50 rounded">{profile.role ?? "-"}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Họ và tên</label>
            <div className="p-2 bg-gray-50 rounded">{profile.full_name ?? "-"}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Số điện thoại</label>
              <div className="p-2 bg-gray-50 rounded">{profile.phone ?? "-"}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Email</label>
              <div className="p-2 bg-gray-50 rounded">{profile.email ?? "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <ProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleProfileSave}
        initialData={profile}
      />

      <ChangePasswordModal
        open={showPwdModal}
        onClose={() => setShowPwdModal(false)}
        onSave={handleChangePassword}
      />
    </div>
  );
};

export default ProfilePage;