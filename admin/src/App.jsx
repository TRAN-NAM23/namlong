import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProductEdit from './pages/ProductEdit.jsx';
import ProductAdd from './pages/ProductAdd.jsx';
import UserDetail from './pages/UserDetail.jsx';
import DiscountList from './pages/DiscountList.jsx';
import DiscountForm from './pages/DiscountForm.jsx';
import OrderList from './pages/OrderList.jsx';
import ShipperSchedule from './pages/ShipperSchedule.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/product/edit/:id" element={<ProductEdit />} />
        <Route path="/add" element={<ProductAdd />} />
        <Route path="/user/edit/:id" element={<UserDetail />} />
        <Route path="/orders" element={<AdminDashboard initialTab="orders" />} />
        <Route path="/shipper-schedule" element={<ShipperSchedule />} />
        <Route path="/discount" element={<AdminDashboard initialTab="discount" />} />
        <Route path="/discount/add" element={<DiscountForm />} />
        <Route path="/discount/edit/:id" element={<DiscountForm />} />
      </Routes>
    </Router>
  );
}

export default App;