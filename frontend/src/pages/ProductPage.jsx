import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../services/api";
import ProductModal from "../components/modals/ProductModal";
import {
  createProduct,
  getProducts,
  updateProduct,
} from "../services/productServices";

const ProductPage = () => {
  const { token } = useAuth(); // not used directly, ensures context present
  const api = useApi(); // axios instance with Authorization header
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [minThreshold, setMinThreshold] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(api);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch products error", err);
      // optional: show toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const units = useMemo(() => {
    const s = new Set(products.map((p) => p.unit).filter(Boolean));
    return ["", ...Array.from(s)];
  }, [products]);

  const statuses = useMemo(() => {
    const s = new Set(products.map((p) => p.product_status).filter(Boolean));
    return ["", ...Array.from(s)];
  }, [products]);

  const filtered = products.filter((p) => {
    const nameMatch = p.product_name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const unitMatch = unitFilter ? p.unit === unitFilter : true;
    const minMatch = minThreshold
      ? (p.minimum ?? 0) <= Number(minThreshold)
      : true;
    const statusMatch = statusFilter ? p.product_status === statusFilter : true;
    return nameMatch && unitMatch && minMatch && statusMatch;
  });

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateProduct(api, editing.product_id, data);
      } else {
        await createProduct(api, data);
      }
      await fetchProducts();
      closeModal();
    } catch (err) {
      console.error("Save product error", err);
      alert(
        err.response?.data?.message || err.message || "Lỗi khi lưu sản phẩm"
      );
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Danh sách sản phẩm</h2>
        <div className="flex gap-2">
          <button
            onClick={openAdd}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            Thêm sản phẩm
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
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="border rounded p-2"
        >
          {units.map((u, idx) => (
            <option key={idx} value={u}>
              {u || "Tất cả đơn vị"}
            </option>
          ))}
        </select>
        <input
          placeholder="Tối thiểu <= ..."
          value={minThreshold}
          onChange={(e) => setMinThreshold(e.target.value)}
          className="border rounded p-2 w-40"
          type="number"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          {statuses.map((u, idx) => (
            <option key={idx} value={u}>
              {u || "Tất cả trạng thái"}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearch("");
            setUnitFilter("");
            setMinThreshold("");
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
              <th className="p-2 border">Đơn vị</th>
              <th className="p-2 border">Giá nhập</th>
              <th className="p-2 border">Giá xuất</th>
              <th className="p-2 border">Tối thiểu</th>
              <th className="p-2 border">Trạng thái</th>
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
                  Không có sản phẩm
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.product_id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border">{p.product_id}</td>
                  <td className="p-2 border">{p.product_name}</td>
                  <td className="p-2 border">{p.unit}</td>
                  <td className="p-2 border">{p.import_price ?? "-"}</td>
                  <td className="p-2 border">{p.export_price ?? "-"}</td>
                  <td className="p-2 border">{p.minimum ?? "-"}</td>
                  <td className="p-2 border">{p.product_status}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => openEdit(p)}
                      className="px-2 py-1 mr-2 border rounded"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editing}
      />
    </div>
  );
};

export default ProductPage;
