import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "./MapLegend.css";

const MapLegend = () => {
  const { t } = useLanguage();
  return (
    <div className="map-legend">
      <h4>{t('map_legend_title')}</h4>
      <ul>
        <li style={{ color: '#003366', fontWeight: "bold" }}><span className="dot good"></span > {t('aqi_good')} (0–50)</li>
        <li style={{ color: '#003366', fontWeight: "bold" }}><span className="dot unhealthy-sensitive"></span> {t('aqi_unhealthy_sensitive')} (100–150)</li>
        <li style={{ color: '#003366', fontWeight: "bold" }}><span className="dot moderate"></span> {t('aqi_moderate')} (50–100)</li>
        <li style={{ color: '#003366', fontWeight: "bold" }}><span className="dot unhealthy"></span> {t('aqi_unhealthy')} (150–200)</li>
        <li style={{ color: '#003366', fontWeight: "bold" }}><span className="dot very-unhealthy"></span> {t('aqi_very_unhealthy')} (200–300)</li>
        <li style={{ color: '#003366', fontWeight: "bold" }}><span className="dot hazardous"></span> {t('aqi_hazardous')} (300+)</li>
      </ul>
    </div>
  );
};

export default MapLegend;
