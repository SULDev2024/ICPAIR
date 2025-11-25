import React from "react";
import { useLanguage } from "../contexts/LanguageContext";


const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="footer" id="contacts">
      <div className="footer-container">
        <div className="footer-section">
          <div className="logo">
            <img src="/Images/Logo-v2.svg" alt="ICPAIR" className="logo-img" />
          </div>
          <p>{t('footer_desc')}</p>
          <p className="copyright">{t('copyright')} 🌍💙</p>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-section">
          <h3>{t('socials')}</h3>
          <p>Instagram <img className="icon" src="/Images/instagram.png" alt="Instagram" /></p>
          <p>Telegram <img className="icon" src="/Images/telegram.png" alt="Telegram" /></p>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-section">
          <h3>{t('contact_us')}</h3>
          <p>icpair2025@gmail.com</p>
          <p>+7 777 777 77 77</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
