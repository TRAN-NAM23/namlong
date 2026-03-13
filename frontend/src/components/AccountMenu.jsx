import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import "./AccountMenu.css";

const AccountMenu = ({ user, onLogout, onOpenPopUp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuItemClick = async (action) => {
    try {
      let response;

      switch (action) {
        case "profile":
          navigate("/Profile");
          break;

        case "orders":
          navigate("/order-history");
          break;

        case "addresses":
          navigate("/addresses");
          break;

        case "favorites":
          navigate("/favorites");
          break;

        case "changePassword":
          navigate("/change-password");
          break;

        case "logout":
          onLogout();
          break;

        case "login":
          onOpenPopUp("login");
          break;

        case "register":
          onOpenPopUp("register");
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(
        "API Error:",
        error?.response?.data || error.message
      );
    }

    setIsOpen(false);
  };

  return (
    <div className="account-menu" ref={menuRef}>
      <div className="account-icon" onClick={toggleMenu}>
        {user && user.avatar ? (
          <img
            src={user.avatar}
            alt="Avatar"
            className="user-avatar-icon"
          />
        ) : (
          <span className="default-icon">👤</span>
        )}
      </div>

      {isOpen && (
        <div className="menu-dropdown">
          {user ? (
            <>
              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("profile")}
              >
                Hồ sơ cá nhân
              </div>

              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("orders")}
              >
                Lịch sử đơn hàng
              </div>

              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("favorites")}
              >
                Danh sách yêu thích
              </div>

              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("changePassword")}
              >
                Đổi mật khẩu
              </div>

              <div
                className="menu-item logout"
                onClick={() => handleMenuItemClick("logout")}
              >
                Đăng xuất
              </div>
            </>
          ) : (
            <>
              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("login")}
              >
                Đăng nhập
              </div>

              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("register")}
              >
                Đăng ký
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountMenu;