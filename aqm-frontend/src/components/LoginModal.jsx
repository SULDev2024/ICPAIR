import React, { useState } from "react";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [resendEmail, setResendEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.username,
                    password: formData.password
                })
            });

            const data = await res.json();
            console.log("Ответ от сервера при входе:", data);

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                localStorage.setItem("isAuthenticated", "true");
                alert("Вход успешен");
                onClose();
            } else if (res.status === 403) {
                alert("Вы не подтвердили email. Проверьте почту и перейдите по ссылке.");
            } else {
                alert(data.message || "Ошибка входа");
            }
        } catch (err) {
            console.error("Ошибка входа:", err);
            alert("Ошибка при соединении с сервером");
        }
    };

    const handleResend = async () => {
        if (!resendEmail) return alert("Введите email для повторной отправки");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/users/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resendEmail })
            });
            const data = await res.json();
            alert(data.message || "Письмо отправлено повторно");
        } catch (err) {
            console.error("Ошибка при повторной отправке:", err);
            alert("Ошибка при повторной отправке письма");
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
                    <span className="active-tab">Вход</span>
                    <span className="inactive-tab" onClick={onSwitchToRegister}>
                        Регистрация
                    </span>
                </div>

                <div className="login-google-auth">
                    <img
                        src="/Images/google-icon.svg"
                        alt="Google"
                        className="login-google-icon"
                    />
                    <span>С помощью Google</span>
                </div>

                <form className="login-modal-form" onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input
                        type="text"
                        placeholder="Введите ваш email"
                        value={formData.username}
                        onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                        }
                    />

                    <label>Пароль</label>
                    <input
                        type="password"
                        placeholder="Введите ваш пароль"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                    />

                    <button type="button" className="forgot-password" onClick={(e) => { e.preventDefault(); console.log('Forgot password clicked'); /* Добавить логику сброса пароля */ }}>
                        Забыли пароль?
                    </button>

                    <button type="submit" className="login-submit-btn">
                        Войти
                    </button>
                </form>

                {/* Повторная отправка письма  */}
                <div className="resend-verification-section" style={{ marginTop: "20px" }}>
                    <p style={{ marginBottom: "8px" }}>Не получили письмо с подтверждением?</p>
                    <input
                        type="email"
                        placeholder="Введите email повторно"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="input-field"
                    />
                    <button type="button" className="login-submit-btn" onClick={handleResend}>
                        Отправить письмо повторно
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
