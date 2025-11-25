# predict_o2.py – Flask API to predict O₂ (placeholder values)

from flask import Flask, request, jsonify
import pandas as pd
import lightgbm as lgb

app = Flask(__name__)

# Load the trained LightGBM model for O₂
model = lgb.Booster(model_file="lightgbm_o2_model.txt")

# Mapping of district to typical PM10 values (used as a feature)
DISTRICT_PM10_MAP = {
    "алатауский": 70,
    "алмалинский": 75,
    "ауэзовский": 85,
    "бостандыкский": 60,
    "медеуский": 55,
    "наурызбайский": 80,
    "турксибский": 95,
    "жетысуский": 90,
}

@app.route('/predict_o2', methods=['POST'])
def predict_o2():
    try:
        data = request.json
        # Basic inputs – district and date
        district = data.get("district", "").lower()
        pm10 = DISTRICT_PM10_MAP.get(district, 70)

        # Feature set – must match training features exactly
        # Training used: ["co2", "pm10", "pm25", "temperature", "humidity", "tvoc"]
        features = {
            "co2": data.get("co2", 410),
            "pm10": pm10,
            "pm25": data.get("pm25", pm10 * 0.6),  # Estimate PM2.5 as ~60% of PM10
            "temperature": data.get("temperature", 10),
            "humidity": data.get("humidity", 40),
            "tvoc": data.get("tvoc", 1),
        }

        df = pd.DataFrame([features])
        prediction = model.predict(df)[0]
        return jsonify({"o2": round(float(prediction), 4)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8010)
