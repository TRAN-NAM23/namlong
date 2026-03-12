import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { getDiscountById, createDiscount, updateDiscount } from '../data/discounts';

const DiscountForm = ({ onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    max_discount_amount: '',
    min_order_amount: 0,
    usage_limit: '',
    usage_per_customer: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true,
    applicable_categories: [],
    applicable_products: []
  });

  useEffect(() => {
    if (id) {
      loadDiscount();
    }
  }, [id]);

  const loadDiscount = async () => {
    try {
      const discount = await getDiscountById(id);
      setForm({
        ...form,
        code: discount.code,
        description: discount.description,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        max_discount_amount: discount.max_discount_amount || '',
        min_order_amount: discount.min_order_amount,
        usage_limit: discount.usage_limit || '',
        usage_per_customer: discount.usage_per_customer,
        start_date: new Date(discount.start_date).toISOString().split('T')[0],
        end_date: new Date(discount.end_date).toISOString().split('T')[0],
        is_active: discount.is_active,
        applicable_categories: discount.applicable_categories,
        applicable_products: discount.applicable_products
      });
    } catch (error) {
      alert('Lỗi tải dữ liệu: ' + error.message);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code || !form.discount_value || !form.end_date) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    try {
      setIsSaving(true);
      const data = {
        ...form,
        discount_value: parseFloat(form.discount_value),
        max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
        min_order_amount: parseFloat(form.min_order_amount),
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        usage_per_customer: parseInt(form.usage_per_customer)
      };

      if (id) {
        await updateDiscount(id, data);
        alert('Cập nhật mã giảm giá thành công!');
      } else {
        await createDiscount(data);
        alert('Tạo mã giảm giá thành công!');
      }
      navigate('/');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="admin-panel"><p>Đang tải...</p></div>;

  return (
    <div className="admin-panel">
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn-back" 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <h2>{id ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h2>

      <form onSubmit={handleSubmit} className="form-container" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label>Mã code *</label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            disabled={!!id}
            placeholder="VD: SUMMER20"
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả về mã giảm giá này"
            rows="3"
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
          />
        </div>

        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Loại giảm giá *</label>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (₫)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giá trị *</label>
            <input
              type="number"
              name="discount_value"
              value={form.discount_value}
              onChange={handleChange}
              placeholder="0"
              step={form.discount_type === 'percentage' ? '0.1' : '1'}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            />
          </div>
        </div>

        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Số tiền giảm tối đa (nếu %)</label>
            <input
              type="number"
              name="max_discount_amount"
              value={form.max_discount_amount}
              onChange={handleChange}
              placeholder="0"
              step="1"
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>Đơn hàng tối thiểu (₫)</label>
            <input
              type="number"
              name="min_order_amount"
              value={form.min_order_amount}
              onChange={handleChange}
              placeholder="0"
              step="1"
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            />
          </div>
        </div>

        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Giới hạn lần sử dụng</label>
            <input
              type="number"
              name="usage_limit"
              value={form.usage_limit}
              onChange={handleChange}
              placeholder="Để trống = không giới hạn"
              step="1"
              min="0"
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>Lần sử dụng/Khách hàng</label>
            <input
              type="number"
              name="usage_per_customer"
              value={form.usage_per_customer}
              onChange={handleChange}
              step="1"
              min="1"
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            />
          </div>
        </div>

        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Ngày bắt đầu *</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>Ngày kết thúc *</label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            {' '}Kích hoạt
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          style={{
            background: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </form>

      <style>{`
        .form-container {
          background: white;
          padding: '20px;
          border-radius: '8px;
        }
        .form-group {
          margin-bottom: '16px;
        }
        .form-group label {
          display: block;
          margin-bottom: '4px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default DiscountForm;
