import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { getUsersByRole } from "../services/auth";
import StockModal from "../components/modals/StockModal";
import RestockModal from "../components/modals/RestockModal";
import { getStocks, updateStock } from "../services/stockServices";
import { useApi } from "../services/api";
import { toast } from "react-toastify";
import { useRefresh } from "../context/RefreshContext";
import { createRestockRequest } from "../services/restockServices";

const StockPage = () => {
  const { token } = useAuth();
  const api = useApi();
  const { refreshKey, triggerRefresh } = useRefresh();
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [requesting, setRequesting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifiedUsers, setNotifiedUsers] = useState([]); // <-- thêm
  const [loadingUsers, setLoadingUsers] = useState(false);
  const notifyRole = ROLES.IMPORTSTAFF;

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const data = await getStocks(api);
      setStocks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch stocks error", err);
      // optional: show toast
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
    if (token) fetchStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshKey]);

  const statusOptions = useMemo(() => {
    const s = new Set(stocks.map((s) => s.stock_status).filter(Boolean));
    return ["", ...Array.from(s)];
  }, [stocks]);

  const filtered = stocks.filter((st) => {
    const prodName = st.products?.product_name ?? "";
    const nameMatch = prodName.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter ? st.stock_status === statusFilter : true;
    return nameMatch && statusMatch;
  });

  const openEdit = (s) => {
    setEditing(s);
    setModalOpen(true);
  };

  const openRequest = (p) => {
    setRequesting(p);
    setRequestModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRequestModalOpen(false);
    setEditing(null);
    setRequesting(null);
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateStock(api, editing.stock_id, data);
        toast.success("Cập nhật thành công!");
      }
      await fetchStocks();
      triggerRefresh();
      closeModal();
    } catch (err) {
      console.error("Save stock error", err);
      toast.warn(
        err.response?.data?.message || err.message || "Lỗi khi cập nhật tồn kho"
      );
    }

    try {
      if (requesting) {
        await createRestockRequest(api, data);
        toast.success("Tạo yêu cầu thành công");
      }
      triggerRefresh();
      closeModal();
    } catch (error) {
      console.error("Creat restock request error", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Lỗi khi tạo yêu cầu nhập hàng"
      );
    }
  };

  const fmtDate = (iso) => {
    try {
      return iso ? new Date(iso).toLocaleString() : "-";
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Tồn kho</h2>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="Tìm kiếm theo tên sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          {statusOptions.map((s, idx) => (
            <option key={idx} value={s}>
              {s || "Tất cả trạng thái"}
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
              <th className="p-2 border">Tồn kho</th>
              <th className="p-2 border">Tối thiểu</th>
              <th className="p-2 border">Cảnh báo</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Lần nhật gần nhất</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  Không có bản ghi
                </td>
              </tr>
            ) : (
              filtered.map((st) => (
                <tr key={st.stock_id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border">{st.stock_id}</td>
                  <td className="p-2 border">
                    {st.products?.product_name ?? "-"}
                  </td>
                  <td className="p-2 border">{st.quantity ?? 0}</td>
                  <td className="p-2 border">{st.products?.minimum ?? "-"}</td>
                  <td className="p-2 border">{st.warning ? "Yes" : "No"}</td>
                  <td className="p-2 border">{st.stock_status ?? "-"}</td>
                  <td className="p-2 border">{fmtDate(st.last_updated_at)}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => openEdit(st)}
                      className="px-2 py-1 mr-2 border rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => openRequest({ product_id: st.product_id })}
                      className="px-2 py-1 mr-2 border rounded"
                    >
                      Yêu cầu nhập
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <StockModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editing}
      />

      <RestockModal
        open={requestModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={requesting}
        notifiedUsers={notifiedUsers}
        loadingUsers={loadingUsers}
      />
    </div>
  );
};

export default StockPage;
