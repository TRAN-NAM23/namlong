import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import '../styles/Breadcrumb.css';

const Breadcrumb = ({ title, parents = [] }) => {
  return (
    <div className="breadcrumb-section">
      <div className="container">
        <Link to="/" className="breadcrumb-link home-link">
           <FaHome style={{marginBottom: '2px'}}/> Trang chủ
        </Link>
        <FaChevronRight className="separator" />

        {/* Render các trang cha trung gian (nếu có) */}
        {parents.map((item, index) => (
          <React.Fragment key={index}>
            <Link to={item.link} className="breadcrumb-link">
              {item.name}
            </Link>
            <FaChevronRight className="separator" />
          </React.Fragment>
        ))}

        {/* Trang hiện tại */}
        <span className="current">{title}</span>
      </div>
    </div>
  );
};

export default Breadcrumb;