import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "./Footer";
import Header from "./Header";
import SensorRequestModal from "./SensorRequestModal";
import "./SensorShop.css";

export default function SensorShop({ onOpenModal/*, onOpenLoginModal*/ }) {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOptions, setSortOptions] = useState({
    popular: false,
    new: false,
    best: false,
    discount: false
  });

  const [filteredSensors, setFilteredSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/sensors`)
      .then(res => {
        let sensors = res.data;

        if (minPrice) {
          sensors = sensors.filter(sensor => sensor.price >= parseInt(minPrice));
        }
        if (maxPrice) {
          sensors = sensors.filter(sensor => sensor.price <= parseInt(maxPrice));
        }

        if (sortOptions.popular) {
          sensors.sort((a, b) => b.popularity - a.popularity);
        } else if (sortOptions.new) {
          sensors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortOptions.best) {
          sensors.sort((a, b) => b.rating - a.rating);
        } else if (sortOptions.discount) {
          sensors = sensors.filter(sensor => sensor.discount === true);
        }

        setFilteredSensors(sensors);
      })
      .catch(err => console.error("Ошибка загрузки данных:", err));
  }, [minPrice, maxPrice, sortOptions]);

  const handlePriceChange = (e, type) => {
    const value = e.target.value;
    if (type === "min") setMinPrice(value);
    if (type === "max") setMaxPrice(value);
  };

  const handleSortChange = (e) => {
    const { id, checked } = e.target;
    setSortOptions(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [id]: checked
    }));
  };

  const handleRequestClick = (sensor) => {
    if (!token) {
      // if (onOpenLoginModal) onOpenLoginModal();
      alert("Пожалуйста, войдите, чтобы оставить заявку на сенсор.");
      return;
    }
    setSelectedSensor(sensor);
    setIsRequestModalOpen(true);
  };

  return (
    <>
      <Header onOpenModal={onOpenModal} /*onOpenLoginModal={onOpenLoginModal}*/ />

      <section className="sensor-shop">
        <h1>Магазин сенсоров</h1>
        <p>Выберите свой сенсор для мониторинга качества воздуха в реальном времени.</p>

        <div className="sensor-shop-content">
          <div className="filter-section">
            <label>Цена</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="от"
                value={minPrice}
                onChange={(e) => handlePriceChange(e, "min")}
              />
              <input
                type="number"
                placeholder="до"
                value={maxPrice}
                onChange={(e) => handlePriceChange(e, "max")}
              />
              <span>₸</span>
            </div>

            <div className="sort-options">
              <label className="sort-title">Сортировка</label>
              {["popular", "new", "best", "discount"].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    id={option}
                    checked={sortOptions[option]}
                    onChange={handleSortChange}
                  />
                  {{
                    popular: "Популярные",
                    new: "Новинки",
                    best: "Оценка пользователей",
                    discount: "Скидки и акции"
                  }[option]}
                </label>
              ))}
            </div>
          </div>

          <div className="sensor-shop-grid">
            {filteredSensors.map(sensor => (
              <div key={sensor.id} className="sensor-shop-card">
                <img
                  src={`${process.env.REACT_APP_STATIC_URL}${sensor.image}`}
                  alt={sensor.name}
                />

                <h3>{sensor.name}</h3>
                <p>{sensor.description}</p>
                <div className="sensor-shop-price">
                  {sensor.price
                    ? `${sensor.price.toLocaleString("ru-RU")} ₸`
                    : "Цена не указана"}
                </div>
                <button onClick={() => handleRequestClick(sensor)}>Купить</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {selectedSensor && (
        <SensorRequestModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </>
  );
}
