const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const District = sequelize.define("District", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = District;
