import React, { useEffect, useState } from "react";
import "./AddSensorModal.css";

export default function AddSensorModal({ onClose, onSensorAdded }) {
  const [sensors, setSensors] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    const fetchUnlinkedSensors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/user-sensors/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const all = await res.json();
        const notNamed = all.filter(s => s.custom_name === null);
        setSensors(notNamed);
      } catch (err) {
        console.error("Ошибка загрузки сенсоров:", err);
      }
    };
    fetchUnlinkedSensors();
  }, []);

  const handleSave = async () => {
    if (!selectedId || !customName) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user-sensors/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ custom_name: customName })
      });

      if (res.ok) {
        alert("Сенсор добавлен!");
        onSensorAdded();
        onClose();
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (err) {
      console.error("Ошибка при обновлении сенсора:", err);
    }
  };

  return (
    <div className="app-modal-overlay">
      <div className="app-modal-window">
        <button className="app-modal-close" onClick={onClose}>×</button>
        <h3>Добавить сенсор</h3>

        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">Выберите сенсор</option>
          {sensors.map(s => (
            <option key={s.id} value={s.id}>
              {(s.Sensor?.name || `Сенсор #${s.id}`)} — {s.device_id}
            </option>
          ))}
        </select>

        {!sensors.length && <p className="no-sensors">Нет доступных сенсоров для добавления</p>}

        <input
          type="text"
          placeholder="Введите имя сенсора"
          value={customName}
          onChange={e => setCustomName(e.target.value)}
        />

        <button className="app-modal-save" onClick={handleSave} disabled={!selectedId || !customName}>
          Сохранить
        </button>
      </div>
    </div>
  );
}
