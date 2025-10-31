import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApi } from '../services/api';
import { getImportReport, getExportReport, getInventoryReport } from '../services/reportsService';

// --- Helpers ---
const formatCurrency = (value) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('vi-VN', options);
};

// --- Component Thống Kê ---
export default function StatisticsPage() {
  const [reportType, setReportType] = useState('import'); // 'import', 'export', 'inventory'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1); // Tháng hiện tại
  const [year, setYear] = useState(new Date().getFullYear()); // Năm hiện tại
  
  const api = useApi();

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    // Định nghĩa hàm load bên trong useEffect
    const loadStatistics = async () => {
      setLoading(true);
      setError(null);
      setData([]); // Xóa dữ liệu cũ
      try {
        let result;
        if (reportType === 'inventory') {
          // Báo cáo tồn kho không cần tháng/năm
          result = await getInventoryReport(api);
        } else if (reportType === 'import') {
          result = await getImportReport(api, { month, year });
        } else if (reportType === 'export') {
          result = await getExportReport(api, { month, year });
        }
        setData(result || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Không thể tải thống kê");
      } finally {
        setLoading(false);
      }
    };
    
    loadStatistics(); // Chạy hàm
    
  }, [api, reportType, month, year]); // (ĐÃ SỬA) Depend trực tiếp vào state

  
  // (ĐÃ XÓA) - Hàm useCallback và useEffect cũ đã bị xóa

  
  // Định nghĩa cột (Giữ nguyên)
  const columns = useMemo(() => {
    if (reportType === 'import') {
      return [
        { key: 'product_id', label: 'ID SP' },
        { key: 'product_name', label: 'Tên Sản Phẩm' },
        { key: 'unit', label: 'ĐVT' },
        { key: 'total_quantity_imported', label: 'Tổng SL Nhập', align: 'right' },
        { key: 'total_value_imported', label: 'Tổng Giá Trị Nhập', align: 'right', format: formatCurrency },
      ];
    }
    if (reportType === 'export') {
      return [
        { key: 'product_id', label: 'ID SP' },
        { key: 'product_name', label: 'Tên Sản Phẩm' },
        { key: 'unit', label: 'ĐVT' },
        { key: 'total_quantity_exported', label: 'Tổng SL Xuất', align: 'right' },
        { key: 'total_value_exported', label: 'Tổng Giá Trị Xuất', align: 'right', format: formatCurrency },
      ];
    }
    if (reportType === 'inventory') {
      return [
        { key: 'product_id', label: 'ID SP' },
        { key: 'product_name', label: 'Tên Sản Phẩm' },
        { key: 'unit', label: 'ĐVT' },
        { key: 'current_stock', label: 'Tồn kho', align: 'right' },
        { key: 'minimum_level', label: 'Tồn tối thiểu', align: 'right' },
        { key: 'warning', label: 'Cảnh báo', format: (val) => (val ? 'Có' : 'Không') },
        { key: 'stock_status', label: 'Trạng thái kho' },
        { key: 'last_updated_at', label: 'Cập nhật cuối', format: formatDate },
      ];
    }
    return [];
  }, [reportType]);

  // --- Render Functions ---

  const renderFilterControls = () => (
    <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
      {/* 1. Chọn loại thống kê */}
      <div className="flex-grow">
        <label className="block text-sm font-medium text-gray-700 mb-1">Xem Thống Kê</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="import">Thống Kê Nhập Kho (Theo Tháng)</option>
          <option value="export">Thống Kê Xuất Kho (Theo Tháng)</option>
          <option value="inventory">Thống Kê Tồn Kho (Hiện tại)</option>
        </select>
      </div>

      {/* 2. Chọn Tháng/Năm (Ẩn đi nếu là Tồn kho) */}
      {reportType !== 'inventory' && (
        <>
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Tháng</label>
            <select
              value={month}
              // (ĐÃ SỬA LỖI KIỂU DỮ LIỆU) Chuyển đổi giá trị sang Number
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Năm</label>
            <select
              value={year}
              // (ĐÃ SỬA LỖI KIỂU DỮ LIỆU) Chuyển đổi giá trị sang Number
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderReportTable = () => {
    if (loading) return <div className="p-10 text-center text-lg text-gray-500">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">Lỗi: {error}</div>;
    if (data.length === 0) return <div className="p-10 text-center text-lg text-gray-500">Không có dữ liệu thống kê cho lựa chọn này.</div>;

    return (
      <div className="shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                    {col.format ? col.format(row[col.key]) : (row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Thống Kê Kho</h1>
      
      {renderFilterControls()}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {renderReportTable()}
      </div>
    </div>
  );
}