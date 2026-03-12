/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct, deleteProduct } from '../data/products';
import '../styles/productEdit.css';
import { FaSave, FaArrowLeft, FaImage, FaFire, FaTags, FaTrash } from 'react-icons/fa';

const ProductEdit = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Tìm sản phẩm khi mới vào trang
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const productData = await getProductById(id);
                if (productData) {
                    setProduct(productData);
                } else {
                    alert("Không tìm thấy sản phẩm!");
                    navigate('/');
                }
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm:", err);
                setError("Không thể tải sản phẩm");
                alert("Không thể tải sản phẩm!");
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, navigate]);

    // Hàm xử lý khi gõ vào ô input và check box ( ô lựa chọn là sp ưu đãi hay đang h)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct({ 
            ...product, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    

    // Hàm lưu sản phẩm
    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!product.name || !product.price) {
            alert("Vui lòng nhập tên và giá sản phẩm!");
            return;
        }
        // ensure descriptionDetail exists to avoid undefined
        if (product.descriptionDetail === undefined) {
            product.descriptionDetail = '';
        }

        setIsSaving(true);
        setError(null);

        try {
            const updated = await updateProduct(id, product);
            console.log("Sản phẩm đã cập nhật:", updated);
            alert("Đã lưu thông tin sản phẩm thành công!");
            navigate('/');
        } catch (err) {
            console.error("Lỗi khi cập nhật sản phẩm:", err);
            setError(err.message || "Có lỗi xảy ra khi lưu sản phẩm");
            alert("Lỗi: " + (err.message || "Không thể lưu sản phẩm"));
        } finally {
            setIsSaving(false);
        }
    };

    // Hàm xóa sản phẩm
    const handleDelete = async () => {
        if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này không?")) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await deleteProduct(id);
            alert("Sản phẩm đã được xóa!");
            navigate('/');
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm:", err);
            setError(err.message || "Có lỗi xảy ra khi xóa sản phẩm");
            alert("Lỗi: " + (err.message || "Không thể xóa sản phẩm"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div style={{padding: '20px', textAlign: 'center'}}>Đang tải...</div>;
    if (!product) return <div style={{padding: '20px', textAlign: 'center'}}>Không tìm thấy sản phẩm</div>;

    return (
        <div className="admin-container">
            <div className="admin-content" style={{marginLeft: 0, width: '100%'}}>
                
                {/* Header */}
                <div className="panel-header" style={{marginBottom: '20px'}}>
                    <button className="btn-back" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Quay lại
                    </button>
                    <h2>Chỉnh sửa sản phẩm #{product.id}</h2>
                </div>

                <div className="admin-panel">
                    {error && <div style={{color: 'red', padding: '10px', marginBottom: '10px', background: '#ffe6e6', borderRadius: '4px'}}>{error}</div>}
                    <form onSubmit={handleSave} className="edit-form">
                        <div className="form-grid">
                            
                            {/* Cột Trái: Thông tin chung */}
                            <div className="form-column">
                                <div className="form-group">
                                    <label>Tên sản phẩm</label>
                                    <input 
                                        type="text" name="name" 
                                        value={product.name} onChange={handleChange} 
                                    />
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>Giá bán (VNĐ)</label>
                                        <input 
                                            type="number" name="price" 
                                            value={product.price} onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Giá ban đầu(VNĐ)</label>
                                        <input 
                                            type="number" name="oldPrice" 
                                            value={product.oldPrice || ''} onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Số lượng</label>
                                    <input 
                                        type="number" name="quantity" 
                                        value={product.quantity || 0} onChange={handleChange} min={0}
                                    />
                                </div>

                                {/* TRẠNG THÁI & ƯU ĐÃI --- */}


                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>Danh mục (Category)</label>
                                        <select name="category" value={product.category} onChange={handleChange}>
                                            <option value="kho">Đồ khô</option>
                                            <option value="tuoi">Đồ tươi</option>
                                            <option value="che-bien">Đồ chế biến</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Vùng miền</label>
                                        <select name="region" value={product.region} onChange={handleChange}>
                                            <option value="bac">Miền Bắc</option>
                                            <option value="trung">Miền Trung</option>
                                            <option value="nam">Miền Nam</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Mô tả chi tiết</label>
                                    <textarea 
                                        name="description" rows="5"
                                        value={product.description} onChange={handleChange}
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Mô tả chi tiết mở rộng</label>
                                    <textarea 
                                        name="descriptionDetail" rows="5"
                                        value={product.descriptionDetail || ''} onChange={handleChange}
                                    ></textarea>
                                </div>

                                                                <div className="promotion-box">
                                    <label className="section-label"><FaTags /> Trạng thái & Ưu đãi</label>
                                    <div className="promotion-grid">
                                        {/* Checkbox sản phẩm nổi bật */}
                                        <label className={`custom-toggle ${product.isHot ? 'active' : ''}`}>
                                            <input 
                                                type="checkbox" 
                                                name="isHot" 
                                                checked={product.isHot || false} 
                                                onChange={handleChange} 
                                            />
                                            <span className="toggle-icon"><FaFire /></span>
                                            <span className="toggle-text">
                                                {product.isHot ? 'Nổi bật🔥' : 'Nổi bật'}
                                            </span>
                                        </label>

                                        {/*  % Giảm giá */}
                                        <div className="discount-input-group">
                                            <span>Giảm giá:</span>
                                            <input 
                                                type="number" 
                                                name="discount" 
                                                value={product.discount || 0} 
                                                onChange={handleChange}
                                                min="0" max="100"
                                            />
                                            <span className="unit">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            

                            {/* Cột Phải: Hình ảnh */}
                            <div className="form-column">
                                <div className="form-group">
                                    <label>Link Ảnh đại diện</label>
                                    <input 
                                        type="text" name="image" 
                                        value={product.image} onChange={handleChange} 
                                    />
                                </div>
                                <div className="image-preview">
                                    <p>Xem trước ảnh:</p>
                                    <img src={product.image} alt="Preview" 
                                         onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'} 
                                    />
                                </div>
                                
                                {/* Demo hiển thị list ảnh con */}
                                <div className="gallery-preview">
                                    <label>Album ảnh ({product.images?.length || 0})</label>
                                    <div className="gallery-grid">
                                        {product.images?.map((img, idx) => (
                                            <img key={idx} src={img} alt="" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/')} disabled={isSaving}>Hủy bỏ</button>
                            <button type="button" className="btn-delete" onClick={handleDelete} disabled={isSaving}>
                                <FaTrash /> Xóa sản phẩm
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

export default ProductEdit;