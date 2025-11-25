module.exports = (sequelize, DataTypes) => {
  const SensorData = sequelize.define("SensorData", {
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sensor_name: {
      type: DataTypes.STRING(50)
    },
    value: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "sensor_data",
    timestamps: false
  });

  return SensorData;
};
