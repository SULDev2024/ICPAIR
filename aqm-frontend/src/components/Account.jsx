import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Account = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("isUserAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
    window.location.reload(); // обновляем, чтобы Header переключился обратно
  };

  return (
    <>
      <Header />
      <main className="account-page">
        <h1>Личный кабинет</h1>
        <p>Добро пожаловать, {username}!</p>
        <button onClick={handleLogout}>Выйти</button>
      </main>
      <Footer />
    </>
  );
};

export default Account;
