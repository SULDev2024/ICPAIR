const express = require("express");
const router = express.Router();
const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const defineUserSensor = require("../models/UserSensor");
const defineSensor = require("../models/Sensor"); // чтобы JOIN сработал

const auth = require("../middleware/authMiddleware");

const UserSensor = defineUserSensor(sequelize, DataTypes);
const Sensor = defineSensor(sequelize, DataTypes);

// Настрой ассоциацию (если используешь include)
UserSensor.belongsTo(Sensor, { foreignKey: "sensor_id" });

// Купить сенсор
router.post("/buy-sensor", auth, async (req, res) => {
  const userId = req.user.id;
  const { sensorId, deviceId } = req.body;

  try {
    const newSensor = await UserSensor.create({
      user_id: userId,
      sensor_id: sensorId,
      device_id: deviceId || null
    });

    res.json({ message: "Сенсор успешно куплен", data: newSensor });
  } catch (err) {
    console.error("Ошибка:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получить "Мои сенсоры"
router.get("/my", async (req, res) => {
  // const userId = req.user.id;
  // Временно используем фиксированный userId=1, пока не будет реализована аутентификация
  const userId = 1; 

  try {
    const sensors = await UserSensor.findAll({
      where: { user_id: userId },
      include: [{ model: Sensor }]
    });

    res.json(sensors);
  } catch (err) {
    console.error("Ошибка при получении сенсоров:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Обновить имя сенсора (custom_name)
router.patch("/:id", auth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { custom_name } = req.body;

  if (!custom_name || custom_name.trim() === "") {
    return res.status(400).json({ message: "Имя не может быть пустым" });
  }

  try {
    const sensor = await UserSensor.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!sensor) {
      return res.status(404).json({ message: "Сенсор не найден" });
    }

    sensor.custom_name = custom_name;
    await sensor.save();

    res.json({ message: "Имя сенсора обновлено", sensor });
  } catch (err) {
    console.error("Ошибка обновления имени сенсора:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// "Удалить" сенсор пользователя: сбросить имя, но не удалять запись
router.delete('/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const sensor = await UserSensor.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!sensor) {
      return res.status(404).json({ message: 'Сенсор не найден или не принадлежит вам' });
    }

    sensor.custom_name = null;
    await sensor.save();

    res.json({ message: 'Сенсор скрыт и доступен для повторного добавления' });
  } catch (err) {
    console.error('Ошибка при скрытии сенсора:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});



module.exports = router;
