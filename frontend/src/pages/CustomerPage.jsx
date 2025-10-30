import React, { useState, useEffect, useCallback } from 'react';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../services/customerServices';
import {useApi} from '../services/api';
import { toast } from 'react-toastify';
import { useRefresh } from '../context/RefreshContext';

// Component con: Modal Thêm/Sửa
// (Bạn có thể tách ra file riêng, ví dụ: CustomerModal.jsx)
const CustomerModal = ({ open, onClose, onSave, customer, loading }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Khi 'customer' prop thay đổi (khi mở modal để Sửa),
  // điền dữ liệu vào form
  useEffect(() => {
    if (customer) {
      setFormData({
        customer_id: customer.customer_id,
        customer_name: customer.customer_name || '',
        address: customer.address || '',
        phone: customer.phone || '',
        email: customer.email || '',
      });
      setErrors({}); // Xóa lỗi cũ
    } else {
      // Mở modal để Thêm mới
      setFormData({
        customer_name: '',
        address: '',
        phone: '',
        email: '',
      });
      setErrors({});
    }
  }, [customer, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_name) newErrors.customer_name = "Tên không được để trống";
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
      onSave(formData); // Gọi hàm onSave từ cha
    }
  };

  if (!open) return null;

  const isEditing = !!formData.customer_id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Cập nhật Khách hàng' : 'Thêm Khách hàng mới'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {['customer_name', 'address', 'phone', 'email'].map(field => {
              const labels = {
                customer_name: 'Tên khách hàng',
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
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Component chính: Trang Khách hàng
export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // null: Thêm mới, object: Sửa

  const api = useApi();
  const { refreshKey, triggerRefresh } = useRefresh();

  // Sử dụng useMemo để debounce (trì hoãn) việc gọi API khi tìm kiếm
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Hàm gọi API
  const fetchCustomers = useCallback(async (page, query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomers(api, { page, limit: 10, q: query });
      setCustomers(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [api]);

  // useEffect chính: Tự động gọi lại API khi trang hoặc từ khóa tìm kiếm thay đổi
  useEffect(() => {
    fetchCustomers(currentPage, debouncedSearchQuery);
  }, [fetchCustomers, currentPage, debouncedSearchQuery, refreshKey]);

  // --- Xử lý Modal ---
  const handleOpenCreate = () => {
    setEditingCustomer(null); // Đặt là null để modal biết là tạo mới
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer); // Đặt là customer để modal biết là sửa
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  // --- Xử lý Hành động CRUD ---
  const handleSave = async (formData) => {
    setModalLoading(true);
    setError(null);
    try {
      if (formData.customer_id) {
        // Cập nhật
        await updateCustomer(api, formData.customer_id, formData);
        toast.success('Cập nhật khách hàng thành công!');
      } else {
        // Thêm mới
        await createCustomer(api, formData);
        toast.success('Thêm khách hàng thành công!');
      }
      handleCloseModal();
      fetchCustomers(currentPage, debouncedSearchQuery); // Tải lại dữ liệu
      triggerRefresh();
    } catch (err) {
      console.error(err);
      toast.error(`Lỗi: ${err.response?.data?.message || err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá khách hàng này?')) {
      try {
        await deleteCustomer(api, id);
        toast.success('Xoá khách hàng thành công!');
        // Tải lại trang hiện tại (hoặc về trang 1 nếu trang hiện tại trống)
        fetchCustomers(currentPage, debouncedSearchQuery); 
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
    if (customers.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không tìm thấy khách hàng nào.</div>;

    return (
      <div className="shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Khách Hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map(customer => (
              <tr key={customer.customer_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{customer.customer_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button onClick={() => handleOpenEdit(customer)} className="text-blue-600 hover:text-blue-800">Sửa</button>
                  <button onClick={() => handleDelete(customer.customer_id)} className="text-red-600 hover:text-red-800">Xoá</button>
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
          Trang <strong>{meta.page}</strong> / <strong>{meta.totalPages}</strong> (Tổng: {meta.total} khách hàng)
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
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Khách hàng</h1>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out"
        >
          + Thêm Khách hàng
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
      <CustomerModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        customer={editingCustomer}
        loading={modalLoading}
      />
    </div>
  );
}

// Custom hook: useDebounce
// Trì hoãn việc cập nhật giá trị để tránh gọi API liên tục
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy timeout nếu value thay đổi
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}