import os
import numpy as np
import pandas as pd
import joblib
import logging
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

logger = logging.getLogger("carboncast")
MODEL_PATH = "models/model.pkl"
FEATURES = ["transport_km", "electricity_kwh", "meat_meals", "flights", "shopping"]

# Approximate emission factors (kg CO2 per unit) used both for synthetic data and breakdown
FACTORS = {
    "transport_km": 0.21 * 365,      # annualized per daily km
    "electricity_kwh": 0.45 * 365,   # annualized per daily kwh
    "meat_meals": 6.5 * 52,          # annualized per weekly meal
    "flights": 250.0,                # per flight (one-off, kept as-is)
    "shopping": 0.1 * 12,            # annualized per monthly spend unit
}


def generate_synthetic_dataset(n=3000):
    rng = np.random.default_rng(42)
    df = pd.DataFrame({
        "transport_km": rng.uniform(0, 100, n),
        "electricity_kwh": rng.uniform(0, 50, n),
        "meat_meals": rng.uniform(0, 21, n),
        "flights": rng.integers(0, 10, n).astype(float),
        "shopping": rng.uniform(0, 500, n),
    })
    noise = rng.normal(0, 200, n)
    df["target"] = (
        df["transport_km"] * FACTORS["transport_km"] / 365
        + df["electricity_kwh"] * FACTORS["electricity_kwh"] / 365
        + df["meat_meals"] * FACTORS["meat_meals"] / 52
        + df["flights"] * FACTORS["flights"]
        + df["shopping"] * FACTORS["shopping"] / 12
        + noise
    ).clip(lower=0)
    return df


def train_model():
    logger.info("Training RandomForestRegressor on synthetic dataset...")
    df = generate_synthetic_dataset(3000)
    X, y = df[FEATURES], df["target"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae, r2 = mean_absolute_error(y_test, preds), r2_score(y_test, preds)
    logger.info(f"Model trained. MAE={mae:.2f}, R2={r2:.3f}")
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model


def load_or_train_model():
    if os.path.exists(MODEL_PATH):
        logger.info("Loading existing model.pkl")
        return joblib.load(MODEL_PATH)
    return train_model()


def predict_footprint(model, data: dict) -> float:
    X = pd.DataFrame([[data[f] for f in FEATURES]], columns=FEATURES)
    pred = model.predict(X)[0]
    return float(max(pred, 0))


def carbon_score(prediction: float) -> float:
    return float(max(0, 100 - prediction / 5))


def carbon_category(score: float) -> str:
    if score <= 40:
        return "High"
    if score <= 70:
        return "Medium"
    return "Low"


def emission_breakdown(data: dict) -> dict:
    raw = {
        "Transport": data["transport_km"] * FACTORS["transport_km"] / 365,
        "Electricity": data["electricity_kwh"] * FACTORS["electricity_kwh"] / 365,
        "Food": data["meat_meals"] * FACTORS["meat_meals"] / 52 + data["flights"] * FACTORS["flights"],
        "Shopping": data["shopping"] * FACTORS["shopping"] / 12,
    }
    total = sum(raw.values()) or 1
    return {k: round(v / total * 100, 2) for k, v in raw.items()}, raw
