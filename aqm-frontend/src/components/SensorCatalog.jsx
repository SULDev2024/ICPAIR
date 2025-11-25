import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "./SensorCatalog.css";

const sensors = [
  { id: 1, name: "ICPAIR 1.0", image: "/Images/sensor1.svg" },
  { id: 2, name: "ICPAIR 2.0", image: "/Images/sensor1.svg" },
  { id: 3, name: "ICPAIR Pro", image: "/Images/sensor1.svg" },
  { id: 4, name: "ICPAIR Ultra", image: "/Images/sensor1.svg" }
];

export default function SensorCatalog() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section id="catalog" className="sensor-catalog">
      <div className="sensor-catalog-header">
        <div className="sensor-catalog-info">
          <div className="icon-wrapper">
            {/* Applied a class to handle SVG color in dark mode */}
            <img src="/Images/catalog-icon.svg" alt="Catalog Icon" className="catalog-image" />
          </div>
          <div className="text-content">
            <h2>{t('catalog_title')}</h2>
            <p>{t('catalog_subtitle')}</p>
          </div>
        </div>
        <div className="sensor-icon-display">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="35" stroke="#00d2d3" strokeWidth="2" opacity="0.3" />
            <circle cx="40" cy="40" r="25" stroke="#00d2d3" strokeWidth="2" opacity="0.5" />
            <rect x="30" y="30" width="20" height="20" rx="3" fill="#00d2d3" />
            <circle cx="40" cy="40" r="3" fill="#1e293b" />
            <line x1="40" y1="15" x2="40" y2="25" stroke="#00d2d3" strokeWidth="2" />
            <line x1="40" y1="55" x2="40" y2="65" stroke="#00d2d3" strokeWidth="2" />
            <line x1="15" y1="40" x2="25" y2="40" stroke="#00d2d3" strokeWidth="2" />
            <line x1="55" y1="40" x2="65" y2="40" stroke="#00d2d3" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="sensor-catalog-grid">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="sensor-catalog-card">
            <div className="card-shine"></div>
            <div className="sensor-catalog-box">
              <img src={sensor.image} alt={sensor.name} className="sensor-catalog-image" />
            </div>
            <div className="sensor-info-row">
              <span className="sensor-catalog-label">{sensor.name}</span>
              <span className="sensor-status-dot"></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}