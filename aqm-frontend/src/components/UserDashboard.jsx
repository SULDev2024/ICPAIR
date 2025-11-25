import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserFooter from "./UserFooter";
import MapWithSensors from "./MapWithSensors";
import PMCharts from "./PMcharts";
import AddSensorModal from "./AddSensorModal";
import "./UserDashboard.css";

function UserDashboard() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("map");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestParameters, setLatestParameters] = useState({});
  const [selectedDeviceIdForMapPanel, setSelectedDeviceIdForMapPanel] = useState(null);
  const navigate = useNavigate();

  const fetchUserSensors = async () => {
    console.log("UserDashboard: fetchUserSensors is being called.");
    try {
      const token = localStorage.getItem("token");

      // if (!token) {
      //   console.warn("Нет токена — запрос не отправлен");
      //   setSensors([]);
      //   setLoading(false);
      //   return;
      // }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/user-sensors/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const text = await response.text();
      const data = JSON.parse(text);

      const formatted = data
        .filter(item => item.custom_name)
        .map(item => ({
          id: item.id,
          name: item.custom_name,
          deviceId: item.device_id,
          address: "Адрес не задан",
          pm25: "--",
          temperature: "--",
          humidity: "--",
          lastUpdate: new Date(item.purchase_date).toLocaleString()
        }));

      console.log("UserDashboard: Received sensors data:", data);
      console.log("UserDashboard: Formatted sensors data (with custom_name and deviceId):");
      formatted.forEach(sensor => console.log(`  Sensor ID: ${sensor.id}, Name: ${sensor.name}, Device ID: ${sensor.deviceId}`));

      setSensors(formatted);
      console.log("UserDashboard: Sensors state after setting:", formatted);
      if (formatted.length > 0) {
        setSelectedDeviceIdForMapPanel(formatted[0].deviceId);
      }
    } catch (err) {
      console.error("Ошибка при получении сенсоров:", err);
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSensors();
  }, []);

  useEffect(() => {
    const fetchLatestParameters = async () => {
      if (activeSection === "map" && selectedDeviceIdForMapPanel) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/air-quality/latest/${selectedDeviceIdForMapPanel}`);
          if (response.ok) {
            const data = await response.json();
            setLatestParameters(data.data);
            console.log("Fetched latest parameters for map panel:", data.data);
          } else {
            console.error("Failed to fetch latest parameters:", response.statusText);
            setLatestParameters({});
          }
        } catch (error) {
          console.error("Error fetching latest parameters:", error);
          setLatestParameters({});
        }
      }
    };

    fetchLatestParameters();
  }, [activeSection, selectedDeviceIdForMapPanel]);

  const handleDeleteSensor = async (id) => {
    const confirmDelete = window.confirm("Удалить сенсор?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user-sensors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Сенсор удалён");
        fetchUserSensors();
      } else {
        const error = await response.json();
        alert("Ошибка: " + (error.message || "не удалось удалить"));
      }
    } catch (err) {
      console.error("Ошибка удаления:", err);
      alert("Ошибка при удалении сенсора");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("isAuthenticated");
    alert("Вы вышли из аккаунта");
    navigate("/");
  };

  return (
    <>
      <div className="dashboard-layout">
        <Sidebar onLogout={handleLogout} onSectionChange={setActiveSection} />

        <main className="dashboard-container">
          {activeSection === "map" && (
            <section className="dashboard-map-section">
              <div className="map-area">
                <MapWithSensors />
              </div>
              <div className="parameters-panel">
                {Object.keys(latestParameters).length > 0 ? (
                  Object.entries(latestParameters).map(([paramName, paramValue]) => (
                    <div key={paramName} className="parameter-item">
                      <p>{paramName}</p>
                      <span>{paramValue} единиц</span>
                    </div>
                  ))
                ) : (
                  <p>Нет данных для отображения параметров.</p>
                )}
              </div>
            </section>
          )}

          {activeSection === "charts" && (
            <section className="dashboard-charts">
              <h2>Графики параметров</h2>
              <div className="charts-scroll">
                {sensors
                  .filter(sensor => {
                    console.log(`UserDashboard: Filtering sensor ${sensor.id} (DeviceId: ${sensor.deviceId}, Custom Name: ${sensor.name})`);
                    return sensor.deviceId;
                  })
                  .map(sensor => (
                    <div key={sensor.id} className="chart-item">
                      <h3>Графики для {sensor.name || `Сенсор #${sensor.id}`} (ID: {sensor.deviceId})</h3>
                      <PMCharts deviceId={sensor.deviceId} />
                    </div>
                  ))}
                {!sensors.some(sensor => {
                  console.log(`UserDashboard: Checking sensor ${sensor.id} for any deviceId for the "no data" message.`);
                  return sensor.deviceId;
                }) && (
                  <p>У вас нет сенсоров с данными для графиков.</p>
                )}
              </div>
            </section>
          )}

          {activeSection === "sensors" && (
            <section className="dashboard-sensors">
              <div className="sensors-header">
                <h2>Мои сенсоры</h2>
                <button className="add-sensor-btn" onClick={() => setIsModalOpen(true)}>
                  Добавить
                </button>
              </div>

              {loading ? (
                <p>Загрузка...</p>
              ) : sensors.length === 0 ? (
                <div className="no-sensors">
                  <p>У вас пока нет сенсоров</p>
                </div>
              ) : (
                <div className="sensors-list">
                  {sensors.map(sensor => (
                    <div key={sensor.id} className="sensor-card">
                      <div className="sensor-info">
                        <h3>{sensor.name}</h3>
                        <p>ID: {sensor.deviceId}</p>
                        <p>{sensor.address}</p>
                        <span className="status active">Активный</span>
                      </div>
                      <div className="sensor-data">
                        <p>PM2.5: {sensor.pm25} µg/m³</p>
                        <p>{sensor.temperature}°C</p>
                        <p>{sensor.humidity}%</p>
                        <p>Последние данные: {sensor.lastUpdate}</p>
                      </div>
                      <div className="sensor-actions">
                        <button className="edit-btn">Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteSensor(sensor.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <UserFooter />
        </main>
      </div>

      {isModalOpen && (
        <AddSensorModal
          onClose={() => setIsModalOpen(false)}
          onSensorAdded={fetchUserSensors}
        />
      )}
    </>
  );
}

export default UserDashboard;

