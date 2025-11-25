const express = require("express");
const multer = require("multer");
const path = require("path");
const sequelize = require("../db"); // подключаем db
const SensorModel = require("../models/Sensor"); // подключаем модель
const Sensor = SensorModel(sequelize, require("sequelize").DataTypes); // инициализируем модель

const router = express.Router();

// Конфигурация хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /admin/sensors/upload
router.post("/sensors/upload", upload.single("image"), async (req, res) => {
  console.log("admin.js загружен");
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  try {
    const { name, description, price } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !description || !price || !image) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      return res.status(400).json({ error: "Некорректная цена" });
    }

    const newSensor = await Sensor.create({
      name,
      description,
      price: priceValue,
      image
    });

    res.status(201).json(newSensor);
  } catch (error) {
    console.error("Ошибка при загрузке сенсора:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
