module.exports = (sequelize, DataTypes) => {
  const UserSensor = sequelize.define("UserSensor", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    sensor_id: { type: DataTypes.INTEGER, allowNull: false },
    device_id: { type: DataTypes.STRING },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    purchase_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        custom_name: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: "UserSensors",
    timestamps: false
  });

  return UserSensor;
};
