import React, { useEffect, useMemo, useState } from "react";
import { toast } from 'react-toastify';
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { useApi } from "../services/api";
import RestockModal from "../components/modals/RestockModal";
import { getUsersByRole } from "../services/auth"
import {
  getAllLinks,
  getLinkById,
  createRestockRequest,
  getAllRestockRequests,
  getRestockRequestById,
} from "../services/restockServices";
import { useRefresh } from "../context/RefreshContext";

const RestockPage = () => {
  const { token } = useAuth();
  const api = useApi();
  const { refreshKey, triggerRefresh } = useRefresh();
  const [restocks, setRestocks] = useState([]);
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifiedUsers, setNotifiedUsers] = useState([]); // <-- thêm
  const [loadingUsers, setLoadingUsers] = useState(false);
  const notifyRole = ROLES.IMPORTSTAFF;

  const fetchRestocks = async () => {
    try {
      setLoading(true);
      const data = await getAllRestockRequests(api);
      setRestocks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch restock requests error", error);
      // option: show toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingUsers(true);
        const users = await getUsersByRole(api, notifyRole);
        if (!mounted) return;
        setNotifiedUsers(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error("Fetch users by role error", error);
        if (mounted) setNotifiedUsers([]);
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token, api, notifyRole]);

  useEffect(() => {
    if (token) fetchRestocks();
  }, [token, refreshKey]);

  const statusOptions = useMemo(() => {
    const s = new Set(restocks.map((s) => s.request_status).filter(Boolean));
    return ["", ...Array.from(s)];
  }, [restocks]);

  const filtered = restocks.filter((rs) => {
    const prodName = rs.products?.product_name ?? "";
    const nameMatch = prodName.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter
      ? rs.request_status === statusFilter
      : true;
    return nameMatch && statusMatch;
  });

  const openAdd = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSave = async (data) => {
    try {
      await createRestockRequest(api, data);
      await fetchRestocks();
      triggerRefresh();
      closeModal();
    } catch (error) {
      console.error("Save restock request error", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Lỗi khi tạo yêu cầu nhập hàng"
      );
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Yêu cầu nhập hàng</h2>
        <div className="flex gap-2">
          <button
            onClick={openAdd}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            Tạo yêu cầu nhập hàng
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="Tìm kiếm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          {statusOptions.map((u, idx) => (
            <option key={idx} value={u}>
              {u || "Tất cả trạng thái"}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
          }}
          className="px-3 py-2 border rounded"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Số lượng yêu cầu</th>
              <th className="p-2 border">Người nhận yêu cầu</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  Không có yêu cầu
                </td>
              </tr>
            ) : (
              filtered.map((rs) => (
                <tr
                  key={rs.request_id}
                  className="odd:bg-white even:bg-gray-50"
                >
                  <td className="p-2 border">{rs.request_id}</td>
                  <td className="p-2 border">
                    {rs.products?.product_name ?? "-"}
                  </td>
                  <td className="p-2 border">{rs.requested_quantity}</td>
                  <td className="p-2 border">{rs.notifiedUser.full_name ?? "-"}</td>
                  <td className="p-2 border">{rs.request_status}</td>
                  <td className="p-2 border">{rs.note ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RestockModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        notifiedUsers={notifiedUsers}
        loadingUsers={loadingUsers}
      />
    </div>
  );
};

export default RestockPage;
