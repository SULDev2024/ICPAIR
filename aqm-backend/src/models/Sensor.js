module.exports = (sequelize, DataTypes) => {
  const Sensor = sequelize.define("Sensor", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2) },
    image: { type: DataTypes.STRING }
  }, {
    tableName: "sensors",
    timestamps: false
  });

  return Sensor;
};
