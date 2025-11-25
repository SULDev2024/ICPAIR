const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const District = require("./District");

const Complaint = sequelize.define("Complaint", {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Foreign key to District
  DistrictId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Districts",
      key: "id"
    }
  }
});

// complaint принадлежит району
Complaint.belongsTo(District);
District.hasMany(Complaint);

module.exports = Complaint;
