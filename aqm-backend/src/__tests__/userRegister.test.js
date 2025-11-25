const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { sequelize, User } = require("../models/testModels");

const app = express();
app.use(bodyParser.json());

app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    await User.create({ username, email, password });

    res.status(200).json({ message: "Письмо для подтверждения отправлено на email" });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe("POST /api/users/register", () => {
  it("успешно регистрирует пользователя", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({
        username: "Тестовый пользователь",
        email: "testuser@example.com",
        password: "12345678"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Письмо для подтверждения отправлено на email");
  });

  it("не регистрирует пользователя без данных", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Все поля обязательны");
  });
});
