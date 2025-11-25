const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { sequelize, Complaint, District } = require("../models/testModels");

const app = express();
app.use(bodyParser.json());

app.post("/api/complaints", async (req, res) => {
  console.log("Получено тело жалобы:", req.body);

  try {
    const { title, category, district, description, name, email } = req.body;

    if (!title || !category || !district || !description || !name || !email) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    const districtInstance = await District.findOne({ where: { name: district } });

    if (!districtInstance) {
      return res.status(400).json({ message: "Указанный район не найден" });
    }

    const complaint = await Complaint.create({
      title,
      category,
      description,
      name,
      email,
      DistrictId: districtInstance.id
    });

    res.status(201).json({ message: "Жалоба успешно сохранена", complaint });
  } catch (error) {
    console.error("Ошибка при сохранении жалобы:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await District.create({ name: "Алмалинский" });
});

describe("POST /api/complaints", () => {
  it("успешно создаёт жалобу", async () => {
    const res = await request(app).post("/api/complaints").send({
      title: "Дым",
      category: "Запах",
      district: "Алмалинский",
      description: "Невозможно дышать",
      name: "Тестов Тест",
      email: "test@example.com"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Жалоба успешно сохранена");
    expect(res.body).toHaveProperty("complaint");
  });

  it("возвращает ошибку, если не хватает полей", async () => {
    const res = await request(app).post("/api/complaints").send({
      title: "",
      category: "",
      district: "",
      description: "",
      name: "",
      email: ""
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Все поля обязательны");
  });
});
