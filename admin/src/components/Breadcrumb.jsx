import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const Breadcrumb = ({ title, parents = [] }) => {
  return (
    <div style={{
      background: '#f8f9fa',
      padding: '15px 0',
      borderBottom: '1px solid #e9ecef',
      marginBottom: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <Link to="/" style={{
          color: '#007bff',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}>
           <FaHome style={{marginBottom: '2px'}}/> Trang chủ
        </Link>
        <FaChevronRight style={{ margin: '0 8px', color: '#6c757d' }} />

        {/* Render các trang cha trung gian (nếu có) */}
        {parents.map((item, index) => (
          <React.Fragment key={index}>
            <Link to={item.path || item.link} style={{
              color: '#007bff',
              textDecoration: 'none'
            }}>
              {item.name}
            </Link>
            <FaChevronRight style={{ margin: '0 8px', color: '#6c757d' }} />
          </React.Fragment>
        ))}

        {/* Trang hiện tại */}
        <span style={{
          color: '#495057',
          fontWeight: '500'
        }}>{title}</span>
      </div>
    </div>
  );
};

export default Breadcrumb;