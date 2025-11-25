require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AQM backend is running");
});

const districtRoutes = require("./routes/districtRoutes");
app.use("/api/districts", districtRoutes);

const complaintRoutes = require("./routes/complaintRoutes");
app.use("/api/complaints", complaintRoutes);

// 
const forecastRoutes = require("./routes/forecastRoutes");
app.use("/api/forecast", forecastRoutes);
// 

const aiRoute = require('./routes/aiRoute');
app.use('/api/ai', aiRoute);


const airQualityRoutes = require("./routes/airQualityRoutes");
app.use("/api/air-quality", airQualityRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const sensorsRoutes = require('./routes/sensorsRoutes');
app.use('/api/sensors', sensorsRoutes);

// для каталога
const userSensorRoutes = require("./routes/userSensors");
app.use("/api/user-sensors", userSensorRoutes);


//admin
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Push notifications
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

console.log("admin маршруты подключены");


app.use("/uploads", express.static("uploads"));




const sequelize = require("./db");

sequelize.authenticate()
  .then(() => console.log("PostgreSQL подключен"))
  .catch(err => console.error("Ошибка подключения к БД:", err));

const Complaint = require("./models/Complaint");
const District = require("./models/District");
const User = require("./models/User");


sequelize.sync({ alter: true }).then(() => {
  console.log("Модели синхронизированы с базой данных");
});

// DEV: ensure districts exist so the frontend can load them
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      const count = await District.count();
      if (count === 0) {
        const names = [
          "Алмалинский район",
          "Медеуский район",
          "Ауэзовский район",
          "Наурызбайский район",
          "Бостандыкский район",
          "Алатауский район",
          "Жетысуский район",
          "Турксибский район"
        ];
        for (const name of names) {
          await District.findOrCreate({ where: { name }, defaults: { name } });
          console.log('Ensured district:', name);
        }
        console.log('Default districts seeded (dev).');
      }
    } catch (e) {
      console.error('Failed to ensure districts:', e);
    }
  })();
}



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);

  // Start alert scheduler for push notifications
  try {
    const alertScheduler = require('./services/alertScheduler');
    alertScheduler.start();
    console.log('Push notification alert scheduler started');
  } catch (error) {
    console.error('Failed to start alert scheduler:', error.message);
    console.log('Push notifications will not work without Firebase credentials');
  }
});
