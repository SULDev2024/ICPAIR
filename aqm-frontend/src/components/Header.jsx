import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../index.css";
import { useLanguage } from "../contexts/LanguageContext";

const Header = ({ onOpenModal, onOpenLoginModal }) => {
  const { language, changeLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const location = useLocation();
  const isShopPage = location.pathname.includes("/shop");

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`cyber-header ${scrolled ? "scrolled" : ""}`}>
      <div className="logo">
        <img src="/Images/Logo-v2.svg" alt="ICPAIR Logo" className="logo-img" />
      </div>

      <button className="burger" onClick={toggleMenu}>
        ☰
      </button>

      <div className={`nav-actions ${isMobileMenuOpen ? "open" : ""}`}>
        <nav>
          <ul className="cyber-nav-list">
            {isShopPage ? (
              <>
                <li><a href="/" className="nav-link">{t('home')}</a></li>
                <li><a href="#contacts" className="nav-link">{t('contacts')}</a></li>
              </>
            ) : (
              <>
                <li><a href="#home" className="nav-link">{t('home')}</a></li>
                <li><a href="#info" className="nav-link">{t('directory')}</a></li>
                <li><a href="#catalog" className="nav-link">{t('catalog')}</a></li>
                <li><a href="#about" className="nav-link">{t('about')}</a></li>
                <li><a href="#contacts" className="nav-link">{t('contacts')}</a></li>
              </>
            )}
          </ul>
        </nav>

        <button
          className="cyber-complaint-btn"
          onClick={() => {
            if (typeof onOpenModal === 'function') onOpenModal();
          }}
        >
          {t('complaint')}
        </button>

        <div className="language-switcher">
          <button
            className={`lang-btn ${language === 'kk' ? 'active' : ''}`}
            onClick={() => changeLanguage('kk')}
          >
            KZ
          </button>
          <button
            className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
            onClick={() => changeLanguage('ru')}
          >
            RU
          </button>
          <button
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            EN
          </button>
        </div>

        {/* --- LOGIN / LOGOUT ICON --- */}
        <a
          href="/dashboard"
          className="nav-login"
          title={isAuthenticated ? t('dashboard') : t('login')}
        >
          {isAuthenticated ? (
            // User Icon (Person)
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          ) : (
            // THE "->]" ICON YOU WANTED
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          )}
        </a>
        {/* --------------------------- */}

      </div>
    </header>
  );
};

export default Header;