import React, { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import '../styles/admin.css';
import { FaChartPie, FaBoxOpen, FaUsers, FaSignOutAlt, FaPlus, FaTrash, FaEdit, FaShoppingCart, FaTag} from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';

// THƯ VIỆN BIỂU ĐỒ
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Legend, BarChart, Bar , Cell
} from 'recharts';

import { getAllProducts, deleteProduct } from '../data/products';
import { getAllUsers, deleteUser } from '../data/user';
import { getAllOrders } from '../data/orders';
import DiscountList from './DiscountList.jsx';
import OrderList from './OrderList.jsx';

const AdminDashboard = ({ initialTab = 'products' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [adminUser] = useState('admin');
  const [listProducts, setListProducts] = useState([]);
  const [listUsers, setListUsers] = useState([]);
  const [listOrder, setListOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [products, users, orders] = await Promise.all([
          getAllProducts(),
          getAllUsers(),
          getAllOrders()
        ]);

        setListProducts(products || []);
        setListUsers(users || []);
        setListOrder(orders || []);
      } catch (error) {
        console.error('Lỗi load dữ liệu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính toán dữ liệu thống kê thực từ MongoDB
  const currentYear = new Date().getFullYear(); // 2026

  // Tính doanh thu theo tháng từ listOrder
  const revenueData = (() => {
    const monthlyData = {};
    listOrder.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth() + 1; // 1-12
          const monthKey = `Thg ${month}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, orders: 0 };
          }
          monthlyData[monthKey].revenue += order.total || 0;
          monthlyData[monthKey].orders += 1;
        }
      }
    });

    // Đảm bảo có đủ 6 tháng, nếu không có dữ liệu thì 0
    const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6'];
    return months.map(month => ({
      month,
      revenue: monthlyData[month]?.revenue || 0,
      orders: monthlyData[month]?.orders || 0
    }));
  })();

  // Tính tổng doanh thu tháng hiện tại
  const currentMonthRevenue = (() => {
    const currentMonth = new Date().getMonth() + 1;
    return listOrder
      .filter(order => {
        if (!order.createdAt) return false;
        const date = new Date(order.createdAt);
        return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);
  })();

  // Tính số đơn hàng mới (tháng hiện tại)
  const newOrdersThisMonth = (() => {
    const currentMonth = new Date().getMonth() + 1;
    return listOrder.filter(order => {
      if (!order.createdAt) return false;
      const date = new Date(order.createdAt);
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
    }).length;
  })();

  // Data Biểu đồ Tròn (Tỷ lệ danh mục sản phẩm)
  // Tự động tính toán từ listProducts
  const categoryData = listProducts.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: product.category, value: 1 });
    }
    return acc;
  }, []);

  // Màu sắc cho biểu đồ tròn
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleDeleteProduct = async (id, e) => {
    if (e) e.stopPropagation(); // Prevent row click
    if(!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }
    
    try {
      await deleteProduct(id);
      setListProducts(listProducts.filter(p => p._id !== id && p.id !== id));
      alert("Sản phẩm đã được xóa!");
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Không thể xóa sản phẩm!");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      setListUsers(listUsers.filter(u => u._id !== id));
      alert("Người dùng đã được xóa!");
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error);
      alert("Không thể xóa người dùng!");
    }
  };

  // Hàm  để hiển thị trạng thái đơn hàng có màu sắc
  const renderStatusBadge = (status) => {
      switch(status) {
          case 'pending': return <span className="status-badge pending">Chờ xử lý</span>;
          case 'shipping': return <span className="status-badge shipping">Đang giao</span>;
          case 'delivered': return <span className="status-badge delivered">Đã giao</span>;
          case 'cancelled': return <span className="status-badge cancelled">Đã hủy</span>;
          default: return <span>{status}</span>;
      }
  };


  if (!adminUser) return null;

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className="admin-sidebar">
        <div className="admin-profile">
            <img src={adminUser.avatar || "https://i.pinimg.com/736x/4b/e8/7d/4be87d31be22d24ea1c4044aec5a6977.jpg"} alt="Admin" />
            <h3>Admin Control</h3>
            <p className="admin-name">Xin chào, {adminUser.fullName}</p>
        </div>
        
        <ul className="admin-menu">
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                <FaChartPie /> Thống kê
            </li>
            <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
                <FaBoxOpen /> Quản lý Sản phẩm
            </li>
            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                <FaUsers /> Quản lý Người dùng
            </li>
             <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                <FaShoppingCart /> Quản lý đơn hàng
            </li>
            <li onClick={() => navigate('/shipper-schedule')}>
                <FaShoppingCart /> Lịch trình shipper
            </li>
            <li className={activeTab === 'discount' ? 'active' : ''} onClick={() => setActiveTab('discount')}>
                <FaTag /> Quản lý Mã giảm giá
            </li>
            <li className="logout-btn">
                <FaSignOutAlt /> Đăng xuất
            </li>
        </ul>
      </div>

      {/* CONTENT */}
            <div className="admin-content">
                {/* Breadcrumb chỉ hiển thị cho các tab KHÔNG PHẢI orders, vì OrderList đã có Breadcrumb riêng */}
                {activeTab !== 'orders' && (
                    <Breadcrumb 
                        title={
                            activeTab === 'dashboard' ? 'Thống kê' :
                            activeTab === 'products' ? 'Quản lý sản phẩm' :
                            activeTab === 'users' ? 'Quản lý người dùng' :
                            activeTab === 'discount' ? 'Quản lý mã giảm giá' :
                            'Trang chủ'
                        }
                        parents={[]} 
                    />
                )}
        
        {/* --- TAB DASHBOARD (THỐNG KÊ) --- */}
        {activeTab === 'dashboard' && (
            <div className="admin-panel">
                <h2>Tổng quan hệ thống</h2>
                
                {/* 1. CÁC THẺ CARD SỐ LIỆU */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Sản phẩm</h3>
                        <p>{listProducts.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Thành viên</h3>
                        <p>{listUsers.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Doanh thu tháng</h3>
                        <p className="highlight-text">{currentMonthRevenue.toLocaleString()} ₫</p>
                    </div>
                    <div className="stat-card">
                        <h3>Đơn hàng mới</h3>
                        <p>{newOrdersThisMonth}</p>
                    </div>
                </div>

                {/* 2. KHU VỰC BIỂU ĐỒ */}
                <div className="charts-container">
                    
                    {/* BIỂU ĐỒ 1: DOANH THU (AREA CHART) */}
                    <div className="chart-card large">
                        <h3>Biểu đồ doanh thu 6 tháng đầu năm {currentYear}</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#b76d28" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#b76d28" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip formatter={(value) => `${value.toLocaleString()} ₫`} />
                                    <Area type="monotone" dataKey="revenue" stroke="#b76d28" fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BIỂU ĐỒ 2: DANH MỤC (PIE CHART) */}
                    <div className="chart-card small">
                        <h3>Tỷ lệ danh mục sản phẩm</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60} // Tạo biểu đồ Donut
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BIỂU ĐỒ 3: SỐ ĐƠN HÀNG (BAR CHART) */}
                    <div className="chart-card full-width">
                        <h3>Số lượng đơn hàng theo tháng ({currentYear})</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="orders" fill="#2e7d32" name="Số đơn hàng" barSize={40} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        )}

        {/* DANH SÁCH SẢN PHẨM */}
        {activeTab === 'products' && (
            <div className="admin-panel">
               <div className="panel-header">
                    <h2>Danh sách sản phẩm</h2>
                    {/* Gắn sự kiện chuyển trang */}
                    <button className="btn-add" onClick={() => navigate('/add')}>
                        <FaPlus /> Thêm mới
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr >
                                <th>ID</th>
                                <th>Ảnh</th>
                                <th style={{width: '30%'}}>Tên sản phẩm</th>
                                <th>Giá bán</th>
                                <th>Danh mục</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Đang tải...</td></tr>
                            ) : listProducts.length > 0 ? (
                                listProducts.map(product => (
                                    <tr 
                                        key={product._id || product.id} 
                                        onClick={() => navigate(`/product/edit/${product._id || product.id}`)}
                                        style={{cursor: 'pointer'}} 
                                        className="clickable-row">
                                        <td>#{product._id?.substring(0, 8) || product.id}</td>
                                        <td><img src={product.image} alt="" className="table-img"/></td>
                                        <td className="product-name-cell">{product.name}</td>
                                        <td>{Number(product.price).toLocaleString()} ₫</td>
                                        <td>
                                            <span className="role-badge admin" style={{background: '#fff3e0', color: '#e65100'}}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-edit" title="Sửa"><FaEdit /></button>
                                            <button className="btn-delete" title="Xóa" onClick={(e) => handleDeleteProduct(product._id || product.id, e)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Chưa có sản phẩm nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* DANH SÁCH NGƯỜI DÙNG */}
        {activeTab === 'users' && (
            <div className="admin-panel">
                <h2>Danh sách người dùng ({listUsers.length})</h2>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên hiển thị</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Ngày đăng ký</th>
                                <th>Xác minh</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Đang tải...</td></tr>
                            ) : listUsers.length > 0 ? (
                                listUsers.map(user => (
                                    <tr 
                                        key={user._id}
                                        onClick={() => navigate(`/user/edit/${user._id}`)}
                                        style={{cursor: 'pointer'}}
                                        className="clickable-row">
                                        <td>#{user._id?.substring(0, 8) || 'N/A'}</td>
                                        <td>{user.fullname || 'N/A'}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || 'N/A'}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span style={{
                                                color: user.isVerified ? 'green' : 'red',
                                                fontWeight: 'bold',
                                                fontSize: '13px'
                                            }}>
                                                {user.isVerified ? '● Đã xác minh' : '● Chưa xác minh'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-edit" title="Sửa"><FaEdit /></button>
                                            <button className="btn-delete" title="Xóa" onClick={(e) => {
                                                e.stopPropagation();
                                                if(window.confirm("Bạn chắc chắn muốn xóa người dùng này?")) {
                                                    handleDeleteUser(user._id);
                                                }
                                            }}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                                        Chưa có người dùng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'orders' && (
          <OrderList />
        )}

        {/* --- TAB DISCOUNT (MÃ GIẢM GIÁ) --- */}
        {activeTab === 'discount' && (
          <DiscountList onBack={() => setActiveTab('dashboard')} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;