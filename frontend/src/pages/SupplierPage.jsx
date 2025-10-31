import React, { useState, useEffect, useCallback } from 'react';
import { 
  getSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} from '../services/supplierService';
import {useApi} from '../services/api';
import { toast } from 'react-toastify';
import { useRefresh } from '../context/RefreshContext';

// Component con: Modal Thêm/Sửa
const SupplierModal = ({ open, onClose, onSave, supplier, loading }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_id: supplier.supplier_id,
        supplier_name: supplier.supplier_name || '',
        address: supplier.address || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
      });
      setErrors({});
    } else {
      setFormData({
        supplier_name: '',
        address: '',
        phone: '',
        email: '',
      });
      setErrors({});
    }
  }, [supplier, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.supplier_name) newErrors.supplier_name = "Tên nhà cung cấp không được để trống";
    if (!formData.address) newErrors.address = "Địa chỉ không được để trống";
    if (!formData.phone) newErrors.phone = "SĐT không được để trống";
    if (!formData.email) newErrors.email = "Email không được để trống";
    else if (!/.+@.+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  if (!open) return null;

  const isEditing = !!formData.supplier_id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Cập nhật Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {['supplier_name', 'address', 'phone', 'email'].map(field => {
              const labels = {
                supplier_name: 'Tên nhà cung cấp',
                address: 'Địa chỉ',
                phone: 'Số điện thoại',
                email: 'Email'
              };
              return (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">{labels[field]}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    id={field}
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>}
                </div>
              )
            })}
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
            <button 
              type="button" 
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" 
              onClick={onClose} 
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Component chính: Trang Nhà cung cấp
export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const api = useApi();
  const { refreshKey, triggerRefresh } = useRefresh();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Hàm gọi API
  const fetchSuppliers = useCallback(async (page, query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSuppliers(api, { page, limit: 10, q: query });
      setSuppliers(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [api]);

  // useEffect chính
  useEffect(() => {
    fetchSuppliers(currentPage, debouncedSearchQuery);
  }, [fetchSuppliers, currentPage, debouncedSearchQuery, refreshKey]);

  // --- Xử lý Modal ---
  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  // --- Xử lý Hành động CRUD ---
  const handleSave = async (formData) => {
    setModalLoading(true);
    setError(null);
    try {
      if (formData.supplier_id) {
        // Cập nhật
        await updateSupplier(api, formData.supplier_id, formData);
        toast.success('Cập nhật nhà cung cấp thành công!');
      } else {
        // Thêm mới
        await createSupplier(api, formData);
        toast.success('Thêm nhà cung cấp thành công!');
      }
      handleCloseModal();
      fetchSuppliers(currentPage, debouncedSearchQuery); // Tải lại dữ liệu
      triggerRefresh();
    } catch (err) {
      console.error(err);
      toast.error(`Lỗi: ${err.response?.data?.message || err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá nhà cung cấp này?')) {
      try {
        await deleteSupplier(api, id);
        toast.success('Xoá nhà cung cấp thành công!');
        fetchSuppliers(currentPage, debouncedSearchQuery); 
        triggerRefresh();
      } catch (err) {
        console.error(err);
        toast.error(`Lỗi: ${err.response?.data?.message || err.message}`);
      }
    }
  };
  
  // --- Render Functions ---

  const renderTable = () => {
    if (loading) return <div className="p-10 text-center text-lg text-gray-500">Đang tải...</div>;
    if (error) return <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>;
    if (suppliers.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không tìm thấy nhà cung cấp nào.</div>;

    return (
      <div className="shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Nhà Cung Cấp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map(supplier => (
              <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{supplier.supplier_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supplier.supplier_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supplier.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supplier.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supplier.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button onClick={() => handleOpenEdit(supplier)} className="text-blue-600 hover:text-blue-800">Sửa</button>
                  <button onClick={() => handleDelete(supplier.supplier_id)} className="text-red-600 hover:text-red-800">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderPagination = () => {
    if (meta.totalPages <= 1) return null;
    
    return (
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-700">
          Trang <strong>{meta.page}</strong> / <strong>{meta.totalPages}</strong> (Tổng: {meta.total} nhà cung cấp)
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={meta.page === 1 || loading}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={meta.page === meta.totalPages || loading}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Nhà cung cấp</h1>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out"
        >
          + Thêm Nhà cung cấp
        </button>
      </div>

      {/* Thanh Tìm kiếm */}
      <div className="mb-6">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm theo tên, SĐT, email..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {renderTable()}
        {renderPagination()}
      </div>

      {/* Modal */}
      <SupplierModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        supplier={editingSupplier}
        loading={modalLoading}
      />
    </div>
  );
}

// Custom hook: useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}