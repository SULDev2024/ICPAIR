const { Sequelize } = require("sequelize");
require("dotenv").config();

// Используем SQLite для тестирования
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false, // можно включить, если хочешь видеть sql в консоли
});

module.exports = sequelize;
