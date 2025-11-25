
// require("dotenv").config();
// const fs = require("fs");
// const path = require("path");
// const csv = require("csv-parser");
// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../src/db");
// const defineAirQuality = require("../src/models/AirQuality");

// const AirQuality = defineAirQuality(sequelize, DataTypes);


// const filePath = path.join(__dirname, "../data/Air Quality data.csv");

// const coordinatesByDevice = {
//   1: { latitude: 43.238949, longitude: 76.889709 },
//   2: { latitude: 43.245278, longitude: 76.873056 },
//   3: { latitude: 43.270000, longitude: 76.920000 },
// };

// async function importData() {
//   const rows = [];

//   fs.createReadStream(filePath)
//     .pipe(csv({ separator: ";" })) 
//     .on("data", (row) => {
//         // Временный лог
//         if (row.sensor_name === "pm25") {
//           console.log("Найдено pm25:", row);
//         }
      
//         if (row.sensor_name === "pm25") {
//           const device_id = parseInt(row.device_id);
//           const coords = coordinatesByDevice[device_id];
      
//           if (coords) {
//             rows.push({
//               station_name: `Sensor #${device_id}`,
//               latitude: coords.latitude,
//               longitude: coords.longitude,
//               parameter: "pm25",
//               value: parseFloat(row.value),
//               unit: "µg/m³",
//               updated_at: new Date(row.timestamp.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1")),
//             });
//           }
//         }
//       })
      
//     .on("end", async () => {
//       try {
//         await sequelize.sync();
//         await AirQuality.bulkCreate(rows);
//         console.log(" Импорт завершён! Добавлено записей:", rows.length);
//         process.exit();
//       } catch (err) {
//         console.error("Ошибка при сохранении в БД:", err);
//         process.exit(1);
//       }
//     });
// }

// importData();
