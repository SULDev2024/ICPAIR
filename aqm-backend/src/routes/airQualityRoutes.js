const express = require("express");
const router = express.Router();
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db");

const defineSensorData = require("../models/SensorData");
const SensorData = defineSensorData(sequelize, DataTypes);

// Генерация симулированных данных
router.post("/generate-mock-data", async (req, res) => {
  try {
    const devices = [1, 2, 3, 4, 5, 6, 7, 8]; // 8 устройств
    const mockData = [];

    devices.forEach(deviceId => {
      // Генерируем данные за последние 24 часа с интервалом в 10 минут
      const now = new Date();
      for (let i = 0; i < 144; i++) { // 24 часа * 6 записей в час
        const timestamp = new Date(now.getTime() - i * 10 * 60 * 1000);
        
        // Генерируем случайные значения
        const pm25 = Math.floor(Math.random() * 150) + 10;
        const pm10 = Math.floor(Math.random() * 200) + 20;
        const temp = (Math.random() * 30 - 5).toFixed(1);
        const humidity = Math.floor(Math.random() * 60) + 30;
        const pressure = Math.floor(Math.random() * 50) + 1000;
        const co2 = Math.floor(Math.random() * 500) + 400;

        // Добавляем записи для каждого сенсора
        mockData.push(
          { device_id: deviceId, sensor_name: 'pm2_5', value: pm25, timestamp },
          { device_id: deviceId, sensor_name: 'pm10', value: pm10, timestamp },
          { device_id: deviceId, sensor_name: 'temp', value: temp, timestamp },
          { device_id: deviceId, sensor_name: 'humidity', value: humidity, timestamp },
          { device_id: deviceId, sensor_name: 'pressure', value: pressure, timestamp },
          { device_id: deviceId, sensor_name: 'co2', value: co2, timestamp }
        );
      }
    });

    // Сохраняем данные в базу
    await SensorData.bulkCreate(mockData);

    res.json({ 
      status: "success", 
      message: "Симулированные данные созданы",
      devices: devices.length,
      records: mockData.length
    });

  } catch (err) {
    console.error("Ошибка при создании симулированных данных:", err);
    res.status(500).json({ error: "Ошибка при создании данных" });
  }
});

// сохранить данные от сенсора
router.post("/submit", async (req, res) => {
  try {
    console.log("=== ВХОДЯЩИЕ ДАННЫЕ ===");
    console.log("Полное тело запроса:", req.body);
    console.log("device_id:", req.body.device_id);
    console.log("Все измерения:", req.body);
    
    const { device_id, ...measurements } = req.body;

    if (!device_id) {
      console.log("ОШИБКА: device_id отсутствует");
      return res.status(400).json({ error: "device_id обязателен" });
    }

    const timestamp = new Date();
    console.log("Временная метка:", timestamp);

    const entries = Object.entries(measurements).map(([sensor_name, value]) => ({
      device_id,
      sensor_name,
      value,
      timestamp
    }));

    console.log("Подготовленные записи для сохранения:", entries);

    await SensorData.bulkCreate(entries);

    console.log("=== ДАННЫЕ УСПЕШНО СОХРАНЕНЫ ===");
    console.log("Принятые параметры:", entries);
    res.json({ status: "успешно", received: entries });

  } catch (err) {
    console.error("Ошибка при сохранении данных:", err);
    res.status(500).json({ error: "Ошибка при сохранении данных" });
  }
});

// получить последние параметры по устройству
router.get("/latest/:device_id", async (req, res) => {
  try {
    const deviceId = req.params.device_id;

    // Найти самую последнюю временную метку для данного устройства
    const latestTimestampEntry = await SensorData.findOne({
      where: { device_id: deviceId },
      order: [['timestamp', 'DESC']],
      attributes: ['timestamp'],
    });

    if (!latestTimestampEntry) {
      return res.status(404).json({ error: "Нет данных для этого устройства" });
    }

    const latestTimestamp = latestTimestampEntry.timestamp;

    // Получить все записи для этой последней временной метки и устройства
    const rawData = await SensorData.findAll({
      where: { device_id: deviceId, timestamp: latestTimestamp },
      attributes: ['sensor_name', 'value'],
    });

    const grouped = {};
    rawData.forEach(entry => {
      grouped[entry.sensor_name] = entry.value;
    });

    res.json({ timestamp: latestTimestamp, data: grouped });

  } catch (err) {
    console.error("Ошибка при получении данных:", err);
    res.status(500).json({ error: "Ошибка при получении данных" });
  }
});

// получить историю параметров для графика
router.get("/history/:device_id", async (req, res) => {
  try {
    const deviceId = req.params.device_id;

    const [rawData] = await sequelize.query(
      `
      SELECT timestamp, sensor_name, value
      FROM sensor_data
      WHERE device_id = :deviceId
      ORDER BY timestamp DESC
      LIMIT 200
      `,
      { replacements: { deviceId } }
    );

    const grouped = {};

    rawData.forEach(entry => {
      const time = entry.timestamp;
      if (!grouped[time]) {
        grouped[time] = { timestamp: time };
      }
      grouped[time][entry.sensor_name] = entry.value;
    });

    const result = Object.values(grouped).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    res.json(result);
  } catch (err) {
    console.error("Ошибка при получении истории:", err);
    res.status(500).json({ error: "Ошибка при получении истории" });
  }
});


module.exports = router;
