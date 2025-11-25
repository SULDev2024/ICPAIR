const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("sqlite::memory:", { logging: false });

const District = sequelize.define("District", {
  name: { type: DataTypes.STRING, allowNull: false }
});

const Complaint = sequelize.define("Complaint", {
  title: DataTypes.STRING,
  category: DataTypes.STRING,
  description: DataTypes.TEXT,
  name: DataTypes.STRING,
  email: DataTypes.STRING
});

Complaint.belongsTo(District);
District.hasMany(Complaint);

const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken: { type: DataTypes.STRING, allowNull: true }
});

const Sensor = sequelize.define("Sensor", {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING }
});

module.exports = { sequelize, Complaint, District, User, Sensor };
