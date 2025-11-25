const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { sequelize, Sensor } = require("../models/testModels");

const app = express();
app.use(bodyParser.json());

app.get("/api/sensors", async (req, res) => {
  const sensors = await Sensor.findAll();
  res.json(sensors);
});

app.post("/api/sensors", async (req, res) => {
  const { name, description, price, image } = req.body;
  if (!name || !description || !price) {
    return res.status(400).json({ message: "Обязательные поля не заполнены" });
  }
  const sensor = await Sensor.create({ name, description, price, image });
  res.status(201).json(sensor);
});

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe("Тесты API сенсоров", () => {
  it("успешно создаёт сенсор", async () => {
    const res = await request(app).post("/api/sensors").send({
      name: "AQM-100",
      description: "Сенсор PM2.5",
      price: 199.99,
      image: "/uploads/sensor.jpg"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "AQM-100");
  });

  it("возвращает список сенсоров", async () => {
    const res = await request(app).get("/api/sensors");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("не даёт создать сенсор без обязательных полей", async () => {
    const res = await request(app).post("/api/sensors").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});
