import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "./MapWithSensors.css";
import MapLegend from "./MapLegend";

// Функция выбора цвета по AQI
const getColorByAQI = (aqi) => {
    if (aqi <= 50) return "green";
    if (aqi <= 100) return "yellow";
    if (aqi <= 150) return "orange";
    if (aqi <= 200) return "red";
    if (aqi <= 300) return "purple";
    return "maroon";
};

const createCustomIcon = (color) =>
    L.divIcon({
        className: "",
        html: `<div class="pulsing-marker" style="--color: ${color}"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

// Симулированные данные датчиков
const generateSimulatedSensors = () => {
    const sensors = [];
    
    // Создаем 8 датчиков в разных районах Алматы
    const locations = [
        { lat: 43.238949, lng: 76.889709, name: "Центр города" },
        { lat: 43.250000, lng: 76.900000, name: "Алмалинский район" },
        { lat: 43.220000, lng: 76.870000, name: "Бостандыкский район" },
        { lat: 43.260000, lng: 76.920000, name: "Медеуский район" },
        { lat: 43.200000, lng: 76.850000, name: "Ауэзовский район" },
        { lat: 43.270000, lng: 76.950000, name: "Турксибский район" },
        { lat: 43.210000, lng: 76.930000, name: "Жетысуский район" },
        { lat: 43.240000, lng: 76.830000, name: "Наурызбайский район" }
    ];

    locations.forEach((location, index) => {
        // Генерируем случайные значения качества воздуха
        const pm25 = Math.floor(Math.random() * 150) + 10; // 10-160 µg/m³
        const pm10 = Math.floor(Math.random() * 200) + 20; // 20-220 µg/m³
        const temp = (Math.random() * 30 - 5).toFixed(1); // -5 до 25°C
        const humidity = Math.floor(Math.random() * 60) + 30; // 30-90%
        
        // Рассчитываем AQI на основе PM2.5
        let aqi;
        if (pm25 <= 12) aqi = Math.floor((pm25 / 12) * 50);
        else if (pm25 <= 35.4) aqi = Math.floor(((pm25 - 12) / (35.4 - 12)) * 50 + 50);
        else if (pm25 <= 55.4) aqi = Math.floor(((pm25 - 35.4) / (55.4 - 35.4)) * 50 + 100);
        else if (pm25 <= 150.4) aqi = Math.floor(((pm25 - 55.4) / (150.4 - 55.4)) * 50 + 150);
        else if (pm25 <= 250.4) aqi = Math.floor(((pm25 - 150.4) / (250.4 - 150.4)) * 100 + 200);
        else aqi = Math.floor(((pm25 - 250.4) / (500.4 - 250.4)) * 100 + 300);

        sensors.push({
            id: index + 1,
            latitude: location.lat,
            longitude: location.lng,
            station_name: location.name,
            pm2_5: pm25,
            pm10: pm10,
            temp: temp,
            humidity: humidity,
            aqi: aqi,
            timestamp: new Date().toISOString()
        });
    });

    return sensors;
};

export default function MapWithSensors() {
    const [sensorData, setSensorData] = useState([]);

    useEffect(() => {
        // Генерируем симулированные данные при загрузке
        const generateSimulatedData = () => {
            const simulatedSensors = generateSimulatedSensors();
            setSensorData(simulatedSensors);
        };

        generateSimulatedData();

        // Обновляем данные каждые 10 секунд
        const interval = setInterval(generateSimulatedData, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <MapContainer
            center={[43.238949, 76.889709]}
            zoom={11}
            style={{ height: "600px", width: "100%", borderRadius: "10px" }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Отображаем симулированные датчики */}
            {sensorData.map((sensor) => (
                <Marker
                    key={sensor.id}
                    position={[sensor.latitude, sensor.longitude]}
                    icon={createCustomIcon(getColorByAQI(sensor.aqi))}
                >
                    <Popup>
                        <strong>{sensor.station_name}</strong><br />
                        PM2.5: {sensor.pm2_5} µg/m³<br />
                        PM10: {sensor.pm10} µg/m³<br />
                        Температура: {sensor.temp} °C<br />
                        Влажность: {sensor.humidity}%<br />
                        AQI: {sensor.aqi}<br />
                        <em>Симулированные данные</em><br />
                        Обновлено: {new Date(sensor.timestamp).toLocaleString()}
                    </Popup>
                </Marker>
            ))}

            <MapLegend />
        </MapContainer>
    );
}






