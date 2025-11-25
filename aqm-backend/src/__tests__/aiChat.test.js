const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/api/ai/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ message: "Пустое сообщение" });
  }

  return res.status(200).json({ reply: `Ответ на: ${message}` });
});

describe("POST /api/ai/chat", () => {
  it("успешно отвечает на запрос", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ message: "Какой сегодня уровень загрязнения?" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
  });

  it("возвращает ошибку при пустом сообщении", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ message: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Пустое сообщение");
  });
});
