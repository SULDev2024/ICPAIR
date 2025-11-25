import React, { useEffect, useState } from "react";
import "./AdminPanel.css";
import "../index.css"
import ComplaintCard from "./ComplaintCard";
import Sidebar from "./Sidebar";

const AdminPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [activeSection, setActiveSection] = useState("complaints");
  const [sortOption, setSortOption] = useState("date_desc");
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  const fetchData = async () => {
    try {
      const [complaintsRes, districtsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/complaints`),
        fetch(`${process.env.REACT_APP_API_URL}/districts`)
      ]);

      const complaintsData = await complaintsRes.json();
      const districtsData = await districtsRes.json();

      setComplaints(complaintsData);
      setDistricts(districtsData);
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDistrictName = (id) => {
    const found = districts.find((d) => d.id === id);
    return found ? found.name : "Неизвестно";
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    window.location.href = "/admin/login";
  };

  const filteredComplaints = complaints.filter((c) =>
    selectedDistrict === "all" ? true : c.DistrictId === Number(selectedDistrict)
  );

  const sortedComplaints = filteredComplaints.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOption === "date_asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar
        onLogout={handleLogout}
        onSectionChange={setActiveSection}
        isAdmin={true}
      />
      <main className="dashboard-container">
        {activeSection === "complaints" && (
          <div className="admin-panel">
            <h2>Жалобы</h2>

            {/* Панель фильтрации и сортировки */}
            <div className="filter-bar">
              <div>
                <label htmlFor="districtFilter">Фильтр по району:</label>
                <select
                  id="districtFilter"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="all">Все районы</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

          

              <div>
                <label htmlFor="sortDate">Сортировка по дате:</label>
                <select
                  id="sortDate"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="date_desc">Сначала новые</option>
                  <option value="date_asc">Сначала старые</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "2rem" }}>
              {sortedComplaints.length === 0 ? (
                <p>Жалоб пока нет.</p>
              ) : (
                sortedComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    districtName={getDistrictName(complaint.DistrictId)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === "addSensor" && (
          <div className="admin-panel">
            <h2>Добавить сенсор</h2>
            <form className="sensor-form"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                fetch(`${process.env.REACT_APP_API_URL}/admin/sensors/upload`, {
                  method: "POST",
                  body: formData,
                })
                  .then((res) => {
                    if (!res.ok) throw new Error("Ошибка при добавлении сенсора");
                    return res.json();
                  })
                  .then(() => {
                    alert("Сенсор успешно добавлен в магазин");
                    e.target.reset();
                  })
                  .catch((err) => {
                    console.error(err);
                    alert("Ошибка: " + err.message);
                  });
              }}
            >
              <label>
                Название сенсора:
                <input type="text" name="name" required className="input-field" />
              </label>

              <label>
                Описание:
                <textarea name="description" rows="4" className="input-field" required />
              </label>

              <label>
                Цена (₸):
                <input type="number" name="price" step="1" required className="input-field" />
              </label>

              <label>
                Изображение:
                <input type="file" name="image" className="input-field" accept="image/*" required />
              </label>

              <button type="submit" className="complaint-button">
                Добавить в магазин
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
