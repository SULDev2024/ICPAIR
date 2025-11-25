import React, { useState } from "react";
import "./LoginModal.css";

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Письмо с подтверждением отправлено. Проверьте почту.");
        onSwitchToLogin();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка регистрации");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button className="login-close-btn" onClick={onClose}>
          ×
        </button>
        <div className="tabs">
          <span className="inactive-tab" onClick={onSwitchToLogin}>
            Вход
          </span>
          <span className="active-tab">Регистрация</span>
        </div>

        <div className="login-google-auth">
          <img src="/Images/google-icon.svg" alt="Google" className="login-google-icon" />
          <span>С помощью Google</span>
        </div>

        <form className="login-modal-form" onSubmit={handleSubmit}>
          <label>Логин</label>
          <input
            type="text"
            placeholder="Введите ваш логин"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Введите ваш email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <label>Пароль</label>
          <input
            type="password"
            placeholder="Придумайте пароль"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Введите пароль еще раз"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
          />

          <button type="submit" className="login-submit-btn">
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
