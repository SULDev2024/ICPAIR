# train_o2.py – Train LightGBM model to predict O₂ (placeholder values)

import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# Path to the original sensor CSV
CSV_PATH = "data/Air Quality data.csv"

# Load data (semicolon‑separated)
df = pd.read_csv(CSV_PATH, sep=";")

# Pivot so each row is a timestamp with sensor columns
pivot = df.pivot_table(index="timestamp", columns="sensor_name", values="value", aggfunc="first")

# Generate placeholder O₂ values from CO₂ (simple heuristic)
# Assume ambient O₂ ≈ 20.95 % – (CO₂‑400 ppm)/10000
# CO₂ values are in ppm; convert to percent effect
pivot["o2"] = 20.95 - (pivot["co2"] - 400) / 10000.0

# Basic feature engineering – use existing sensors as features
features = ["co2", "pm10", "pm25", "temperature", "humidity", "tvoc"]
X = pivot[features].fillna(method="ffill").fillna(method="bfill")
y = pivot["o2"].fillna(method="ffill").fillna(method="bfill")

# Train‑test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# train_o2.py – Train LightGBM model to predict O₂ (placeholder values)

import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# Path to the original sensor CSV
CSV_PATH = "data/Air Quality data.csv"

# Load data (semicolon‑separated)
df = pd.read_csv(CSV_PATH, sep=";")

# Pivot so each row is a timestamp with sensor columns
pivot = df.pivot_table(index="timestamp", columns="sensor_name", values="value", aggfunc="first")

# Generate placeholder O₂ values from CO₂ (simple heuristic)
# Assume ambient O₂ ≈ 20.95 % – (CO₂‑400 ppm)/10000
# CO₂ values are in ppm; convert to percent effect
pivot["o2"] = 20.95 - (pivot["co2"] - 400) / 10000.0

# Basic feature engineering – use existing sensors as features
features = ["co2", "pm10", "pm25", "temperature", "humidity", "tvoc"]
X = pivot[features].fillna(method="ffill").fillna(method="bfill")
y = pivot["o2"].fillna(method="ffill").fillna(method="bfill")

# Train‑test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# LightGBM dataset
train_data = lgb.Dataset(X_train, label=y_train)
valid_data = lgb.Dataset(X_test, label=y_test, reference=train_data)

params = {
    "objective": "regression",
    "metric": "mae",
    "learning_rate": 0.05,
    "num_leaves": 31,
    "seed": 42,
}

# Train the model (no early stopping for compatibility)
model = lgb.train(params, train_data, num_boost_round=500, valid_sets=[valid_data])

# Evaluate
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)
print(f"O₂ prediction MAE: {mae:.4f}")

# Save model
model.save_model("lightgbm_o2_model.txt")
