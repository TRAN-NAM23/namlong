import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { getAllDiscounts, deleteDiscount } from '../data/discounts';
import Breadcrumb from '../components/Breadcrumb';
import '../styles/admin.css';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const DiscountList = ({ onBack }) => {
  const [discounts, setDiscounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setIsLoading(true);
      const data = await getAllDiscounts();
      setDiscounts(data);
    } catch (error) {
      alert('Lỗi tải danh sách mã giảm giá: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa mã giảm giá này?')) {
      return;
    }

    try {
      await deleteDiscount(id);
      alert('Xóa mã giảm giá thành công!');
      loadDiscounts();
    } catch (error) {
      alert('Lỗi xóa mã giảm giá: ' + error.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/discount/edit/${id}`);
  };

  return (
    <div className="admin-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ display: 'inline-block' }}>Quản lý mã giảm giá</h2>
        <button className="btn-add" onClick={() => navigate('/discount/add')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FaPlus /> Thêm mới
        </button>
      </div>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : discounts.length === 0 ? (
        <p>Không có mã giảm giá nào. <a href="#" onClick={() => navigate('/discount/add')}>Tạo mới</a></p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã code</th>
                <th>Mô tả</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Sử dụng/Giới hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => (
                <tr key={discount._id}>
                  <td><strong>{discount.code}</strong></td>
                  <td>{discount.description || '-'}</td>
                  <td>{discount.discount_type === 'percentage' ? '%' : '₫'}</td>
                  <td>{discount.discount_type === 'percentage' ? discount.discount_value + '%' : formatCurrency(discount.discount_value)}</td>
                  <td>{formatDate(discount.start_date)}</td>
                  <td>{formatDate(discount.end_date)}</td>
                  <td>
                    {discount.usage_count}
                    {discount.usage_limit ? ` / ${discount.usage_limit}` : ' / Không giới hạn'}
                  </td>
                  <td>
                    <span className={`badge ${discount.is_active ? 'active' : 'inactive'}`}>
                      {discount.is_active ? 'Hoạt động' : 'Đã tắt'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(discount._id)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(discount._id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .btn-back {
          background: #666;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .btn-back:hover {
          background: #555;
        }
        .btn-add {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-add:hover {
          background: #218838;
        }
        .badge {
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
        }
        .badge.active {
          background: #d4edda;
          color: #155724;
        }
        .badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .btn-edit, .btn-delete {
          padding: 5px 8px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-edit {
          background: #007bff;
          color: white;
        }
        .btn-delete {
          background: #dc3545;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default DiscountList;
