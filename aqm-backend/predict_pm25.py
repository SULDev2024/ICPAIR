# predict_pm25.py как Flask API
from flask import Flask, request, jsonify
import pandas as pd
import lightgbm as lgb
import psycopg2 # type: ignore
from psycopg2.extras import RealDictCursor # type: ignore

# Определение приложения Flask
app = Flask(__name__)

# Загрузка модели LightGBM из .txt-файла
model = lgb.Booster(model_file="lightgbm_pm25_model.txt")

# Словарь районов
district_pm10_map = {
    "алатауский": 70,
    "алмалинский": 75,
    "ауэзовский": 85, 
    "бостандыкский": 60,
    "медеуский": 55,
    "наурызбайский": 80,
    "турксибский": 95,
    "жетысуский": 90
}

@app.route('/predict', methods=['POST'])
def predict_predict():
    try:
        input_data = request.json

        district = input_data.get("district", "").lower()
        pm10 = district_pm10_map.get(district, 70)

        date = pd.Timestamp(input_data["date"])
        hour = date.hour
        dayofweek = date.dayofweek
        month = date.month

        features = {
            "co2": 410,
            "pm10": pm10,
            "temperature": 10,
            "humidity": 40,
            "noise": 50,
            "hour": hour,
            "dayofweek": dayofweek,
            "month": month,
            "pm25_lag_1": 60,
            "pm25_lag_2": 62,
            "pm25_lag_4": 61,
            "pm25_lag_6": 63,
            "pm25_lag_12": 65,
            "pm25_lag_24": 66,
            "pm25_roll_3": 62,
            "pm25_roll_6": 63,
            "pm25_roll_12": 64,
        }

        df = pd.DataFrame([features])
        prediction = model.predict(df)[0]

        return jsonify({"pm25": round(float(prediction), 1)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Получаем последние значения с device_id = 4
def get_latest_sensor_data():
    try:
        conn = psycopg2.connect(
            dbname="aqm_db",
            user="postgres",
            password="blub",
            host="aqm-postgres",  # внутри Docker-сети
            port="5432"
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT sensor_name, value
            FROM sensor_data
            WHERE device_id = 4
              AND timestamp = (
                  SELECT MAX(timestamp)
                  FROM sensor_data
                  WHERE device_id = 4
              )
        """)

        rows = cursor.fetchall()
        conn.close()

        latest = {}
        for row in rows:
            latest[row["sensor_name"]] = row["value"]

        return latest
    except Exception as e:
        print("Ошибка при подключении к БД:", e)
        return {}

@app.route('/forecast', methods=['POST'])
def predict_forecast():
    try:
        input_data = request.json
        date = pd.Timestamp(input_data["date"])

        # Временные признаки
        hour = date.hour
        dayofweek = date.dayofweek
        month = date.month

        # Получаем последние данные с сенсора
        latest_data = get_latest_sensor_data()

        features = {
            "co2": latest_data.get("co2", 410),
            "pm10": latest_data.get("pm10", 70),
            "temperature": latest_data.get("temp", 10),
            "humidity": latest_data.get("hum", 40),
            "noise": 50,  # пока фиксированное значение
            "hour": hour,
            "dayofweek": dayofweek,
            "month": month,
            "pm25_lag_1": latest_data.get("pm2_5", 60),
            "pm25_lag_2": latest_data.get("pm2_5", 62),
            "pm25_lag_4": latest_data.get("pm2_5", 61),
            "pm25_lag_6": latest_data.get("pm2_5", 63),
            "pm25_lag_12": latest_data.get("pm2_5", 65),
            "pm25_lag_24": latest_data.get("pm2_5", 66),
            "pm25_roll_3": latest_data.get("pm2_5", 62),
            "pm25_roll_6": latest_data.get("pm2_5", 63),
            "pm25_roll_12": latest_data.get("pm2_5", 64),
        }

        df = pd.DataFrame([features])
        prediction = model.predict(df)[0]

        return jsonify({"pm25": round(float(prediction), 1)})
    except Exception as e:
        print("Ошибка при прогнозе:", e)
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8008)
