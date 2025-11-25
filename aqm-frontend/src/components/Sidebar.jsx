import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import "./Sidebar.css";

const Sidebar = ({ onLogout, onSectionChange, isAdmin = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeOnMobile = () => {
    if (window.innerWidth <= 768) setIsOpen(false);
  };

  const handleNavigateHome = () => {
    navigate("/");
    closeOnMobile();
  };

  const handleShopClick = () => {
    navigate("/shop");
    closeOnMobile();
  };

  const handleSectionClick = (section) => {
    if (onSectionChange) onSectionChange(section);
    closeOnMobile();
  };

  return (
    <>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <img src="/Images/user-sidebar.svg" alt="Меню" className="menu-icon" />
      </div>

      <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-logo">
          <img src="/Images/Logo-v2.svg" alt="ICPAIR Logo" />
        </div>

        <nav className="sidebar-nav">
          <ul>
            {isAdmin ? (
              <>
                <li>
                  <button onClick={() => handleSectionClick("complaints")}>Жалобы</button>
                </li>
                <li>
                  <button onClick={() => handleSectionClick("addSensor")}>Добавить сенсор</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button onClick={handleNavigateHome}>Главная</button>
                </li>
                <li>
                  <button onClick={() => handleSectionClick("map")}>Карта</button>
                </li>
                <li>
                  <button onClick={() => handleSectionClick("charts")}>Графики</button>
                </li>
                <li>
                  <button onClick={() => handleSectionClick("sensors")}>Мои сенсоры</button>
                </li>
                <li>
                  <img
                    src="/Images/shop-icon.svg"
                    alt="Магазин"
                    className="sidebar-shop-btn"
                    onClick={handleShopClick}
                  />
                </li>
              </>
            )}
            <li>
              <button
                onClick={() => {
                  onLogout();
                  closeOnMobile();
                }}
                className="sidebar-logout-btn"
              >
                Выйти
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
