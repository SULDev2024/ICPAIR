import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import NotificationService from "../services/NotificationService";
import "./ForecastSection.css";

// --- O₂ MOLECULE ICON ---
const O2Icon = ({ level }) => {
    // Color based on O₂ level
    const getColor = () => {
        if (level >= 20.5) return '#2ed573'; // Green - Healthy
        if (level >= 19.5) return '#ffa502'; // Orange - Moderate
        return '#ff4757'; // Red - Low/Concerning
    };

    const color = getColor();

    return (
        <svg width="40" height="40" viewBox="0 0 60 40" className="o2-molecule">
            {/* Left O atom */}
            <circle cx="15" cy="20" r="10" fill="none" stroke={color} strokeWidth="2" className="atom-circle" />
            <text x="15" y="24" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">O</text>

            {/* Right O atom */}
            <circle cx="45" cy="20" r="10" fill="none" stroke={color} strokeWidth="2" className="atom-circle" />
            <text x="45" y="24" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">O</text>

            {/* Double bond between atoms */}
            <line x1="25" y1="18" x2="35" y2="18" stroke={color} strokeWidth="1.5" className="bond-line" />
            <line x1="25" y1="22" x2="35" y2="22" stroke={color} strokeWidth="1.5" className="bond-line" />
        </svg>
    );
};

// Database expects English keys
const districts = [
    "Alatau", "Almaly", "Auezov", "Bostandyk",
    "Medeu", "Nauryzbay", "Turksib", "Zhetysu"
];

const ForecastSection = () => {
    const { t, language } = useLanguage();
    const [forecast, setForecast] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(districts[0]);
    const [loading, setLoading] = useState(false);

    // Fetch PM2.5 prediction from backend
    const fetchPM25Prediction = async (district, date) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';
            const response = await fetch(`${apiUrl}/forecast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    district: district,
                    date: date.toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch PM2.5 prediction');
            }

            const data = await response.json();
            return data.pm25 || 50; // Default to 50 if no data
        } catch (error) {
            console.error('Error fetching PM2.5 prediction:', error);
            // Return a random value between 20-120 as fallback
            return Math.floor(Math.random() * 100) + 20;
        }
    };

    // Fetch O₂ prediction from backend using PM values
    const fetchO2Prediction = async (district, date, pm25, pm10) => {
        try {
            const o2ApiUrl = process.env.REACT_APP_O2_API_URL || 'http://localhost:8010';
            const response = await fetch(`${o2ApiUrl}/predict_o2`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    district: district.toLowerCase(),
                    date: date.toISOString(),
                    // Use real PM values and estimated sensor data
                    pm25: pm25,
                    co2: 400 + (pm25 * 2), // Estimate CO2 based on PM2.5
                    temperature: 10 + Math.random() * 15, // Random temp 10-25°C
                    humidity: 30 + Math.random() * 40, // Random humidity 30-70%
                    tvoc: Math.floor(Math.random() * 5) + 1 // Random TVOC 1-5
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch O₂ prediction');
            }

            const data = await response.json();
            return data.o2;
        } catch (error) {
            console.error('Error fetching O₂ prediction:', error);
            // Return a value based on PM levels (higher PM = slightly lower O2)
            return 20.95 - (pm25 / 1000);
        }
    };

    useEffect(() => {
        const generateForecast = async () => {
            setLoading(true);
            const days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return date;
            });

            // Manual translation maps
            const daysMap = {
                'ru': ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
                'en': ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
                'kk': ['ЖЕК', 'ДҮЙ', 'СЕЙ', 'СӘР', 'БЕЙ', 'ЖҰМ', 'СЕН']
            };

            const monthsMap = {
                'ru': ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
                'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                'kk': ['Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел']
            };

            const currentLang = language || 'ru';
            const dayNames = daysMap[currentLang] || daysMap['ru'];
            const monthNames = monthsMap[currentLang] || monthsMap['ru'];

            // Fetch PM2.5 and O₂ predictions for all days
            const results = await Promise.all(
                days.map(async (date) => {
                    const dayName = dayNames[date.getDay()];
                    const dayNum = date.getDate();
                    const monthName = monthNames[date.getMonth()];
                    const formattedDate = `${dayNum} ${monthName}`;

                    // Fetch PM2.5 prediction for this day
                    const pm25 = await fetchPM25Prediction(selectedDistrict, date);
                    // Estimate PM10 as ~1.7x PM2.5
                    const pm10 = Math.round(pm25 * 1.7);

                    // Fetch O₂ prediction using the PM values
                    const o2Value = await fetchO2Prediction(selectedDistrict, date, pm25, pm10);

                    return {
                        day: dayName,
                        date: formattedDate,
                        pm25: pm25,
                        pm10: pm10,
                        o2: o2Value,
                    };
                })
            );

            setForecast(results);
            setLoading(false);
        };

        // Generate initial forecast
        generateForecast();

        // Update forecast every 30 seconds
        const interval = setInterval(generateForecast, 30000);

        return () => clearInterval(interval);
    }, [selectedDistrict, language]);

    // Check forecast and send advance warnings
    useEffect(() => {
        if (forecast.length > 1) {
            // Check tomorrow's forecast (index 1)
            const tomorrow = forecast[1];
            if (tomorrow && (tomorrow.pm25 > 75 || tomorrow.pm10 > 150)) {
                NotificationService.checkForecast(tomorrow, selectedDistrict);
            }
        }
    }, [forecast, selectedDistrict]);

    // Determine color class based on PM2.5 level (for AQI)
    const getPM25StatusClass = (pm25Value) => {
        if (pm25Value <= 35) return "glow-green";   // Good
        if (pm25Value <= 75) return "glow-orange";  // Moderate
        return "glow-red";                          // Unhealthy
    };

    // Determine color class based on O₂ level
    const getO2StatusClass = (o2Value) => {
        if (o2Value >= 20.5) return "glow-green";   // Healthy
        if (o2Value >= 19.5) return "glow-orange";  // Moderate
        return "glow-red";                          // Low/Concerning
    };

    return (
        <section className="forecast-section">
            <div className="forecast-container">
                <div className="forecast-header">
                    <div className="header-title">
                        <span className="section-label">/// {t('weather_data')}</span>
                        <h2 className="neon-text">{t('forecast_title')} ({selectedDistrict})</h2>
                    </div>

                    <div className="header-actions">
                        <select
                            className="cyber-select"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                        >
                            {districts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="forecast-grid">
                    {forecast.map((f, i) => {
                        const isToday = i === 0;
                        const hasData = f.pm25 !== null && f.o2 !== null;
                        const statusClass = hasData ? getPM25StatusClass(f.pm25) : "glow-green";

                        return (
                            <div key={i} className={`day-card ${isToday ? 'active' : ''} ${statusClass}`}>
                                <div className="day-name">{f.day}</div>
                                <div className="day-date">{f.date}</div>

                                {/* PM2.5 and PM10 Display */}
                                <div className="pm-values">
                                    <div className="pm-item">
                                        <span className="pm-label">PM2.5</span>
                                        <span className="pm-value">{hasData ? Math.round(f.pm25) : "--"}</span>
                                    </div>
                                    <div className="pm-item">
                                        <span className="pm-label">PM10</span>
                                        <span className="pm-value">{hasData ? Math.round(f.pm10) : "--"}</span>
                                    </div>
                                </div>

                                {/* O₂ Display */}
                                <div className="o2-section">
                                    <div className="o2-icon-wrapper">
                                        {hasData ? <O2Icon level={f.o2} /> : <div className="loading-icon">...</div>}
                                    </div>
                                    <div className={`o2-value ${getO2StatusClass(f.o2)}`}>
                                        {hasData ? `${f.o2.toFixed(2)}%` : "--"}
                                    </div>
                                    <div className="o2-label">{t('o2_level')}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ForecastSection;