/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../data/products';
import '../styles/ProductAdd.css';
import { FaSave, FaArrowLeft, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const ProductAdd = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State ban đầu rỗng
    const [product, setProduct] = useState({
        // eslint-disable-next-line react-hooks/purity
        id: Date.now(), // Tự sinh ID ngẫu nhiên
        name: '',
        price: 0,
        oldPrice: 0,
        category: 'kho',
        region: 'bac',
        image: '', // Ảnh đại diện
        images: [], // Album ảnh phụ
        description: '',
        descriptionDetail: '',
        isHot: false,
        discount: 0,
        quantity: 0 // Thêm trường số lượng
    });

    //  Xử lý nhập liệu thông thường
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct({ 
            ...product, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    // Hàm chuyển file thành Base64 string
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // 2. Xử lý UPLOAD ẢNH ĐẠI DIỆN
    const handleMainImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Chuyển file thành Base64
                const base64String = await fileToBase64(file);
                setProduct({ ...product, image: base64String });
            } catch (error) {
                console.error("Lỗi tải ảnh:", error);
                alert("Lỗi tải ảnh!");
            }
        }
    };

    // 3.  UPLOAD ALBUM ẢNH (Nhiều ảnh)
    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        try {
            // Chuyển tất cả file thành Base64
            const base64Images = await Promise.all(
                files.map(file => fileToBase64(file))
            );
            
            // Nối thêm vào mảng ảnh cũ
            setProduct({ 
                ...product, 
                images: [...product.images, ...base64Images] 
            });
        } catch (error) {
            console.error("Lỗi tải ảnh:", error);
            alert("Lỗi tải ảnh!");
        }
    };

    // Xóa ảnh trong album
    const removeGalleryImage = (index) => {
        const newImages = product.images.filter((_, i) => i !== index);
        setProduct({ ...product, images: newImages });
    };

    // 4. Lưu sản phẩm
    const handleSave = async (e) => {
        e.preventDefault();
        
        // Validate đơn giản
        if (!product.name || !product.price) {
            alert("Vui lòng nhập tên và giá sản phẩm!");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Chuẩn bị dữ liệu gửi lên (không gửi id)
            const productData = {
                name: product.name,
                price: product.price,
                oldPrice: product.oldPrice || null,
                category: product.category,
                region: product.region,
                image: product.image,
                images: product.images,
                description: product.description,
                descriptionDetail: product.descriptionDetail,
                isHot: product.isHot,
                discount: product.discount,
                quantity: product.quantity // Thêm số lượng
            };
            console.log('productData to submit', productData); // debug helper

            // Gọi API để lưu sản phẩm
            const savedProduct = await addProduct(productData);
            console.log("Sản phẩm đã được lưu:", savedProduct);
            
            alert("Thêm sản phẩm thành công!");
            navigate('/');
        } catch (err) {
            console.error("Lỗi khi thêm sản phẩm:", err);
            setError(err.message || "Có lỗi xảy ra khi thêm sản phẩm");
            alert("Lỗi: " + (err.message || "Không thể thêm sản phẩm"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-content" style={{marginLeft: 0, width: '100%'}}>
                
                <div className="panel-header" style={{marginBottom: '20px'}}>
                    <button className="btn-back" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Quay lại
                    </button>
                    <h2>Thêm sản phẩm mới</h2>
                </div>

                <div className="admin-panel">
                    {error && <div style={{color: 'red', padding: '10px', marginBottom: '10px', background: '#ffe6e6', borderRadius: '4px'}}>{error}</div>}
                    <form onSubmit={handleSave} className="edit-form">
                        <div className="form-grid">
                            
                            {/* CỘT TRÁI: THÔNG TIN */}
                            <div className="form-column">
                                <div className="form-group">
                                    {/* tên sản phẩm  */}
                                    <label>Tên sản phẩm <span style={{color:'red'}}>*</span></label>
                                    <input type="text" name="name" placeholder="Nhập tên sản phẩm..." value={product.name} onChange={handleChange} required />
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        {/* giá bán hiện tại sau khi áp dụng ưu đãi đối với  các sp có ưu đãi*/}
                                        <label>Giá bán</label>
                                        <input type="number" name="price" value={product.price} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        {/* giá bán ban đầu  */}
                                        <label>Giá ban đầu</label>
                                        <input type="number" name="oldPrice" value={product.oldPrice} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    {/* số lượng sản phẩm */}
                                    <label>Số lượng</label>
                                    <input type="number" name="quantity" value={product.quantity} onChange={handleChange} min={0} />
                                </div>

                                <div className="form-row-2">
                           {/* danh mục sản phẩm  */}
                                    <div className="form-group">
                                        <label>Danh mục</label>
                                        <select name="category" value={product.category} onChange={handleChange}>
                                            <option value="kho">Đồ khô</option>
                                            <option value="tuoi">Đồ tươi</option>
                                            <option value="che-bien">Đồ chế biến</option>
                                        </select>
                                    </div>

                                    {/* sản phẩm thuộc vùng miền nào */}
                                    <div className="form-group">
                                        <label>Vùng miền</label>
                                        <select name="region" value={product.region} onChange={handleChange}>
                                            <option value="bac">Miền Bắc</option>
                                            <option value="trung">Miền Trung</option>
                                            <option value="nam">Miền Nam</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Mô tả tóm tắt */}
                                <div className="form-group">
                                    <label>Mô tả tóm tắt</label>
                                    <textarea name="description" rows="3" placeholder="Mô tả ngắn sản phẩm..." value={product.description} onChange={handleChange}></textarea>
                                </div>

                                {/* Mô tả chi tiết (hiển thị ở trang chi tiết) */}
                                <div className="form-group">
                                    <label>Mô tả chi tiết</label>
                                    <textarea name="descriptionDetail" rows="8" placeholder="Chi tiết sản phẩm (có thể dùng ký tự xuống dòng để phân đoạn)..." value={product.descriptionDetail} onChange={handleChange}></textarea>
                                </div>
                            </div>

                            {/* CỘT PHẢI: HÌNH ẢNH (TÍNH NĂNG MỚI) */}
                            <div className="form-column">
                                
                                {/* 1. ẢNH ĐẠI DIỆN */}
                                <div className="form-group">
                                    <label>Ảnh đại diện</label>
                                    
                                    {/* Khu vực Upload */}
                                    <div className="upload-box">
                                        <label htmlFor="main-upload" className="upload-label">
                                            <FaCloudUploadAlt size={30} />
                                            <span>Bấm để chọn ảnh</span>
                                        </label>
                                        <input 
                                            id="main-upload" 
                                            type="file" 
                                            accept="image/*" 
                                            hidden 
                                            onChange={handleMainImageUpload} 
                                        />
                                    </div>

                                    {/* Hoặc nhập link */}
                                    <input 
                                        type="text" 
                                        name="image" 
                                        placeholder="Hoặc dán link ảnh online vào đây..." 
                                        value={product.image} 
                                        onChange={handleChange} 
                                        style={{marginTop: '10px'}}
                                    />
                                </div>

                                {/* Xem trước Ảnh Đại Diện */}
                                {product.image && (
                                    <div className="image-preview">
                                        <img src={product.image} alt="Preview" />
                                    </div>
                                )}
                                
                                {/* 2. ALBUM ẢNH PHỤ */}
                                <div className="form-group" style={{marginTop: '20px'}}>
                                    <label>Album ảnh phụ</label>
                                    <div className="upload-box small">
                                        <label htmlFor="gallery-upload" className="upload-label">
                                            <FaCloudUploadAlt /> Chọn nhiều ảnh
                                        </label>
                                        <input 
                                            id="gallery-upload" 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            hidden 
                                            onChange={handleGalleryUpload} 
                                        />
                                    </div>
                                    
                                    {/* Grid hiển thị album */}
                                    <div className="gallery-grid">
                                        {product.images.map((img, idx) => (
                                            <div key={idx} className="gallery-item">
                                                <img src={img} alt="" />
                                                <button 
                                                    type="button" 
                                                    className="btn-remove-img"
                                                    onClick={() => removeGalleryImage(idx)}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')} disabled={isLoading}>Hủy bỏ</button>
                            <button type="submit" className="btn-save" disabled={isLoading}>
                                <FaSave /> {isLoading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductAdd;