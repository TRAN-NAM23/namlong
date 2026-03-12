import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/account.css';
import '../../styles/profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({
    avatar: '',
    cover: ''
  });
  const [formData, setFormData] = useState({
    fullname: '',
    avatar: '',
    cover: ''
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchUserOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/account/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          fullname: data.user.fullname || '',
          avatar: data.user.avatar || '',
          cover: data.user.cover || ''
        });
        setPreviewUrls({
          avatar: data.user.avatar || '',
          cover: data.user.cover || ''
        });
      } else {
        alert('Không thể tải thông tin profile');
        navigate('/login');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      alert('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/orders/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({
        ...prev,
        [name]: url
      }));

      // Convert to base64 for demo
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          [name]: reader.result // base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new CustomEvent('userChanged'));
    navigate('/');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Đã sao chép link hồ sơ!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Đã sao chép link hồ sơ!');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Không thể sao chép link. Vui lòng copy thủ công: ' + url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);
    setUpdating(true);

    try {
      const token = localStorage.getItem('token');
      
      // Use FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('fullname', formData.fullname);
      
      // For demo, still send base64 as string
      if (formData.avatar && formData.avatar.startsWith('data:')) {
        formDataToSend.append('avatar', formData.avatar);
      }
      if (formData.cover && formData.cover.startsWith('data:')) {
        formDataToSend.append('cover', formData.cover);
      }

      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData
        },
        body: formDataToSend
      });

      console.log('Update response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Update response data:', data);
        setUser(data.user);
        setFormData({
          fullname: data.user.fullname || '',
          avatar: data.user.avatar || '',
          cover: data.user.cover || ''
        });
        setPreviewUrls({
          avatar: data.user.avatar || '',
          cover: data.user.cover || ''
        });
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('userChanged'));
        alert('Cập nhật profile thành công!');
        setIsEditing(false); // Close edit mode after success
      } else {
        const errorData = await response.json();
        console.log('Update error:', errorData);
        alert('Cập nhật thất bại: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Lỗi kết nối: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="profile-page-wrapper">Đang tải...</div>;
  }

  if (!user) {
    return <div className="profile-page-wrapper">Không tìm thấy thông tin user</div>;
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-card">
        <h2 className="profile-title">Hồ sơ cá nhân</h2>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button 
            className="profile-action-btn edit-btn" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
          </button>
          <button 
            className="profile-action-btn share-btn" 
            onClick={handleShare}
          >
            Chia sẻ hồ sơ
          </button>
          <button 
            className="profile-action-btn logout-btn" 
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>

        {/* Cover Image */}
        <div className="cover-section">
          <label htmlFor="cover-upload" className={`cover-upload-label ${!isEditing ? 'disabled' : ''}`}>
            <img
              src={previewUrls.cover || 'https://via.placeholder.com/800x200?text=Cover+Image'}
              alt="Cover"
              className="cover-image"
            />
            {isEditing && (
              <div className="cover-overlay">
                <span>Thay đổi ảnh bìa</span>
              </div>
            )}
          </label>
          {isEditing && (
            <input
              type="file"
              id="cover-upload"
              name="cover"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          )}
        </div>

        {/* Avatar */}
        <div className="avatar-section">
          <label htmlFor="avatar-upload" className={`avatar-upload-label ${!isEditing ? 'disabled' : ''}`}>
            <img
              src={previewUrls.avatar || 'https://via.placeholder.com/150?text=Avatar'}
              alt="Avatar"
              className="avatar-image"
            />
            {isEditing && (
              <div className="avatar-overlay">
                <span>Thay đổi avatar</span>
              </div>
            )}
          </label>
          {isEditing && (
            <input
              type="file"
              id="avatar-upload"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          )}
        </div>

        {/* User Info Display */}
        {!isEditing && (
          <div className="profile-info-display">
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>Họ tên:</label>
              <span>{user.fullname || 'Chưa cập nhật'}</span>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-group">
              <label>Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label>Họ tên / Nickname</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className="profile-input"
                placeholder="Nhập họ tên hoặc nickname"
              />
            </div>

            <button type="submit" className="profile-btn" disabled={updating}>
              {updating ? 'Đang cập nhật...' : 'Cập nhật profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;