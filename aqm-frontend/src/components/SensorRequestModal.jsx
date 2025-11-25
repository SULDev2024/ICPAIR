import React, { useState } from "react";
import "./SensorRequestModal.css";

export default function SensorRequestModal({ sensor, onClose }) {
  const sensorName = sensor?.name || "сенсор";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    comment: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/sensor-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sensorName })
      });
      alert(`Вы успешно оформили заявку на сенсор ${sensorName}. Сотрудники с вами в скором времени свяжутся.`);
      onClose();
    } catch (error) {
      alert("Ошибка отправки заявки");
      console.error(error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Заявка на сенсор «{sensorName}»</h3>
        <input name="fullName" placeholder="ФИО" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input name="phone" placeholder="Телефон" onChange={handleChange} />
        <textarea name="comment" placeholder="Комментарий (необязательно)" onChange={handleChange} />
        <div className="modal-actions">
          <button onClick={handleSubmit}>Отправить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

