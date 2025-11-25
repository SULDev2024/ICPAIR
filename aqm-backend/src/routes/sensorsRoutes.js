const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');

// подключаем sequelize (если еще нет)
const sequelize = new Sequelize('aqm_db', 'postgres', 'blub', {
  host: 'aqm-postgres', // или 'localhost' если локально
  dialect: 'postgres'
});

// определяем модель
const Sensor = sequelize.define('Sensor', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  price: DataTypes.DECIMAL(10,2),
  image: DataTypes.STRING
}, { tableName: 'sensors', timestamps: false });

// создаем эндпоинт
router.get('/', async (req, res) => {
  try {
    const sensors = await Sensor.findAll();
    res.json(sensors);
  } catch (err) {
    console.error('Ошибка при получении сенсоров:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


module.exports = router;
