import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser, deleteUser } from '../data/user';
import '../styles/productEdit.css';
import { FaSave, FaArrowLeft, FaTrash, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const userData = await getUserById(id);
                if (userData) {
                    setUser(userData);
                } else {
                    alert("Không tìm thấy người dùng!");
                    navigate('/');
                }
            } catch (err) {
                console.error("Lỗi khi tải người dùng:", err);
                setError("Không thể tải người dùng");
                alert("Không thể tải người dùng!");
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUser({
            ...user,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!user.email) {
            alert("Vui lòng nhập email!");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const updateData = {
                fullname: user.fullname,
                email: user.email,
                phone: user.phone
            };

            const updated = await updateUser(id, updateData);
            console.log("Người dùng đã cập nhật:", updated);
            alert("Đã lưu thông tin người dùng thành công!");
            navigate('/');
        } catch (err) {
            console.error("Lỗi khi cập nhật người dùng:", err);
            setError(err.message || "Có lỗi xảy ra khi lưu người dùng");
            alert("Lỗi: " + (err.message || "Không thể lưu người dùng"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bạn chắc chắn muốn xóa người dùng này không?")) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await deleteUser(id);
            alert("Người dùng đã được xóa!");
            navigate('/');
        } catch (err) {
            console.error("Lỗi khi xóa người dùng:", err);
            setError(err.message || "Có lỗi xảy ra khi xóa người dùng");
            alert("Lỗi: " + (err.message || "Không thể xóa người dùng"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
    if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Không tìm thấy người dùng</div>;

    return (
        <div className="admin-container">
            <div className="admin-content" style={{ marginLeft: 0, width: '100%' }}>
                <div className="panel-header" style={{ marginBottom: '20px' }}>
                    <button className="btn-back" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Quay lại
                    </button>
                    <h2>Chỉnh sửa người dùng #{user._id?.substring(0, 8)}</h2>
                </div>

                <div className="admin-panel">
                    {error && <div style={{color: 'red', padding: '10px', marginBottom: '10px', background: '#ffe6e6', borderRadius: '4px'}}>{error}</div>}
                    <form onSubmit={handleSave} className="edit-form">
                        <div className="form-grid">
                            <div className="form-column">
                                {/* Tên đầy đủ */}
                                <div className="form-group">
                                    <label>Tên đầy đủ</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={user.fullname || ''}
                                        onChange={handleChange}
                                        placeholder="Nhập tên người dùng..."
                                    />
                                </div>

                                {/* Email */}
                                <div className="form-group">
                                    <label><FaEnvelope /> Email <span style={{color:'red'}}>*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nhập email..."
                                    />
                                </div>

                                {/* Số điện thoại */}
                                <div className="form-group">
                                    <label><FaPhone /> Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={user.phone || ''}
                                        onChange={handleChange}
                                        placeholder="Nhập số điện thoại..."
                                    />
                                </div>

                                {/* Tên đăng nhập */}
                                <div className="form-group">
                                    <label>Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        value={user.username || 'Không có'}
                                        disabled
                                        placeholder="N/A"
                                        style={{backgroundColor: '#f5f5f5'}}
                                    />
                                </div>
                            </div>

                            <div className="form-column">
                                {/* Trạng thái xác minh */}
                                <div className="form-group">
                                    <label>Trạng thái xác minh</label>
                                    <div style={{padding: '10px', backgroundColor: user.isVerified ? '#e8f5e9' : '#fff3e0', borderRadius: '4px', color: user.isVerified ? '#2e7d32' : '#e65100', fontWeight: 'bold'}}>
                                        {user.isVerified ? '✓ Đã xác minh email' : '⚠ Chưa xác minh email'}
                                    </div>
                                </div>

                                {/* Ngày tạo tài khoản */}
                                <div className="form-group">
                                    <label><FaCalendar /> Ngày đăng ký</label>
                                    <input
                                        type="text"
                                        value={new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        disabled
                                        style={{backgroundColor: '#f5f5f5'}}
                                    />
                                </div>

                                {/* Loại đăng nhập */}
                                <div className="form-group">
                                    <label>Loại đăng nhập</label>
                                    <div style={{padding: '10px', backgroundColor: '#f0f4ff', borderRadius: '4px'}}>
                                        {user.googleId ? '<img src="https://cdn-icons-png.flaticon.com/128/281/281764.png" alt="Google" style={{width: "20px", marginRight: "5px"}} /> Google Login' : ''}
                                        {user.facebookId ? '<img src="https://cdn-icons-png.flaticon.com/128/733/733547.png" alt="Facebook" style={{width: "20px", marginRight: "5px"}} /> Facebook Login' : ''}
                                        {!user.googleId && !user.facebookId ? '✓ Email & Password' : ''}
                                    </div>
                                </div>

                                {/* Avatar */}
                                {user.avatar && (
                                    <div className="form-group">
                                        <label>Avatar</label>
                                        <div className="image-preview">
                                            <img src={user.avatar} alt="Avatar" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/')} disabled={isSaving}>
                                Hủy bỏ
                            </button>
                            <button type="button" className="btn-delete" onClick={handleDelete} disabled={isSaving}>
                                <FaTrash /> Xóa người dùng
                            </button>
                            <button type="submit" className="btn-save" disabled={isSaving}>
                                <FaSave /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
