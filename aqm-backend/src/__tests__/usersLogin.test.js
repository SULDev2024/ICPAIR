const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize, User } = require("../models/testModels");

const app = express();
app.use(bodyParser.json());

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, "test_jwt_secret", {
      expiresIn: "1h"
    });

    res.json({ token });
  } catch (err) {
    console.error("Ошибка авторизации:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const hashedPassword = await bcrypt.hash("password123", 10);
  await User.create({
    username: "Тестовый пользователь",
    email: "testlogin@example.com",
    password: hashedPassword,
    isVerified: true
  });
});

describe("POST /api/users/login", () => {
  it("успешно авторизует пользователя", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "testlogin@example.com",
      password: "password123"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("возвращает ошибку при неверном пароле", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "testlogin@example.com",
      password: "неверный"
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Неверный email или пароль");
  });

  it("возвращает ошибку при несуществующем email", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "notfound@example.com",
      password: "123"
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Неверный email или пароль");
  });
});
