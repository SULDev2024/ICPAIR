module.exports = (sequelize, DataTypes) => {
    const AirQuality = sequelize.define("AirQuality", {
      station_name: DataTypes.STRING,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      parameter: DataTypes.STRING,       
      value: DataTypes.FLOAT,
      unit: DataTypes.STRING,            
      updated_at: DataTypes.DATE
    }, {
      tableName: "air_quality_data",
      timestamps: false
    });
  
    return AirQuality;
  };
  

