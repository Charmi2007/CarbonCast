import os
import joblib
import logging
import pandas as pd

logger = logging.getLogger("carboncast")

PREDICTOR_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(PREDICTOR_DIR, "models", "model.pkl")

# Approximate emission factors (kg CO2 per unit) used both for synthetic data and breakdown
FACTORS = {
    "transport_km": 0.21 * 365,      # annualized per daily km
    "electricity_kwh": 0.45 * 365,   # annualized per daily kwh
    "meat_meals": 6.5 * 52,          # annualized per weekly meal
    "flights": 250.0,                # per flight (one-off, kept as-is)
    "shopping": 0.1 * 12,            # annualized per monthly spend unit
}


def train_model():
    logger.info("Training best model on real dataset/carboncast.csv...")
    from ml.train_model import train_model as run_training
    return run_training()


def load_or_train_model():
    if os.path.exists(MODEL_PATH):
        logger.info("Loading existing model.pkl")
        return joblib.load(MODEL_PATH)
    return train_model()


def map_to_ml_features(data: dict) -> dict:
    """
    Maps input data to the 10 features expected by the trained ML model.
    Handles both raw frontend payloads, already mapped 10-key formats, and 5-key legacy formats (from simulator).
    """
    # 1. Check if 10 ML features are already present
    if "Transport_Mode" in data and "Distance_km" in data:
        return {
            "Transport_Mode": data.get("Transport_Mode"),
            "Distance_km": float(data.get("Distance_km") or 0),
            "Fuel_Type": data.get("Fuel_Type") or "None",
            "Flight_Trips": float(data.get("Flight_Trips") or 0),
            "Diet_Type": data.get("Diet_Type") or "Mixed",
            "Electricity_kWh": float(data.get("Electricity_kWh") or 0),
            "Organic_Waste_kg": float(data.get("Organic_Waste_kg") or 13.0),
            "Plastic_Waste_kg": float(data.get("Plastic_Waste_kg") or 5.0),
            "Water_Liters": float(data.get("Water_Liters") or 336.0),
            "Trees_Planted": float(data.get("Trees_Planted") or 0.0),
        }

    # 2. Check if this is a raw frontend payload (nested sections)
    if "transportation" in data or "home" in data or "food" in data or "lifestyle" in data:
        transport = data.get("transportation", {})
        home = data.get("home", {})
        food = data.get("food", {})
        lifestyle = data.get("lifestyle", {})

        # Transport_Mode mapping
        pt = transport.get("primaryTransport", "Walk")
        if pt == "Metro":
            mode = "Train"
        elif pt == "Cycle":
            mode = "Bike"
        elif pt in ["Car", "Bike", "Train", "Walk", "Bus"]:
            mode = pt
        else:
            mode = "Walk"

        # Distance_km mapping
        distance = float(transport.get("weeklyDistance") or 0)

        # Fuel_Type mapping
        fuel = transport.get("fuelType") or transport.get("fuel_type")
        if not fuel:
            if mode == "Car":
                fuel = "Petrol"
            elif mode == "Bus":
                fuel = "Diesel"
            elif mode == "Train":
                fuel = "Electric"
            else:
                fuel = "None"
        if fuel is None or str(fuel).lower() in ["none", "nan"]:
            fuel = "None"

        # Flight_Trips mapping
        flights = float(transport.get("flightsYearly") or 0)

        # Diet_Type mapping
        diet_pref = food.get("diet", "Mixed")
        if diet_pref == "Vegan":
            diet = "Vegan"
        elif diet_pref in ["Vegetarian", "Eggetarian"]:
            diet = "Vegetarian"
        else:
            diet = "Mixed"

        # Electricity_kWh mapping
        electricity = (float(home.get("electricityBill") or 0) / 4.5) + (float(home.get("acCount") or 0) * float(home.get("acUsageDaily") or 0) * 1.2)

        # Organic_Waste_kg mapping (default to dataset mean)
        organic = float(lifestyle.get("organicWaste") or lifestyle.get("organic_waste") or 13.0)

        # Plastic_Waste_kg mapping (estimate from plasticBottlesWeekly if not provided)
        plastic_bottles = float(lifestyle.get("plasticBottlesWeekly") or 0)
        plastic = float(lifestyle.get("plasticWaste") or lifestyle.get("plastic_waste") or min(max(plastic_bottles * 0.5, 0.0), 10.0))

        # Water_Liters mapping (default to dataset mean)
        water = float(lifestyle.get("waterUsage") or lifestyle.get("water_liters") or 336.0)

        # Trees_Planted mapping
        trees = float(lifestyle.get("treesPlanted") or lifestyle.get("trees_planted") or 0.0)

        return {
            "Transport_Mode": mode,
            "Distance_km": distance,
            "Fuel_Type": fuel,
            "Flight_Trips": flights,
            "Diet_Type": diet,
            "Electricity_kWh": electricity,
            "Organic_Waste_kg": organic,
            "Plastic_Waste_kg": plastic,
            "Water_Liters": water,
            "Trees_Planted": trees,
        }

    # 3. Fallback: 5-key dict format (e.g. from simulator or predict endpoint)
    transport_km = float(data.get("transport_km") or 0)
    electricity_kwh = float(data.get("electricity_kwh") or 0)
    meat_meals = float(data.get("meat_meals") or 0)
    flights = float(data.get("flights") or 0)
    shopping = float(data.get("shopping") or 0)

    mode = "Car" if transport_km > 0 else "Walk"
    distance = transport_km * 7.0
    fuel = "Petrol" if mode == "Car" else "None"
    flights_val = flights
    
    if meat_meals == 0:
        diet = "Vegan"
    elif meat_meals < 3:
        diet = "Vegetarian"
    else:
        diet = "Mixed"

    electricity = electricity_kwh
    organic = 13.0
    plastic = min(max(shopping / 50.0, 1.0), 10.0)
    water = 336.0
    trees = 0.0

    return {
        "Transport_Mode": mode,
        "Distance_km": distance,
        "Fuel_Type": fuel,
        "Flight_Trips": flights_val,
        "Diet_Type": diet,
        "Electricity_kWh": electricity,
        "Organic_Waste_kg": organic,
        "Plastic_Waste_kg": plastic,
        "Water_Liters": water,
        "Trees_Planted": trees,
    }


def predict_footprint(model, data: dict) -> float:
    mapped = map_to_ml_features(data)
    columns = [
        "Transport_Mode", "Distance_km", "Fuel_Type", "Flight_Trips", "Diet_Type",
        "Electricity_kWh", "Organic_Waste_kg", "Plastic_Waste_kg", "Water_Liters", "Trees_Planted"
    ]
    df = pd.DataFrame([mapped], columns=columns)
    pred = model.predict(df)[0]
    return float(max(pred, 0))


def explain_prediction(data: dict) -> dict:
    """
    Computes the contribution of each category to the total predicted CO2e in kg,
    based on the trained Linear Regression model coefficients.
    """
    mapped = map_to_ml_features(data)
    
    # Extract values
    dist = mapped.get("Distance_km", 0)
    flights = mapped.get("Flight_Trips", 0)
    elec = mapped.get("Electricity_kWh", 0)
    organic = mapped.get("Organic_Waste_kg", 0)
    plastic = mapped.get("Plastic_Waste_kg", 0)
    water = mapped.get("Water_Liters", 0)
    trees = mapped.get("Trees_Planted", 0)
    mode = mapped.get("Transport_Mode", "Walk")
    fuel = mapped.get("Fuel_Type", "None")
    diet = mapped.get("Diet_Type", "Mixed")

    # Categorical coefficients from model training
    mode_coefs = {"Bike": 0.5380, "Bus": 4.8469, "Car": -0.9778, "Train": -3.5350, "Walk": -0.8720}
    fuel_coefs = {"Diesel": 2.6790, "Electric": 1.4908, "None": -2.7435, "Petrol": -1.4262}
    diet_coefs = {"Mixed": 0.3328, "Vegan": -0.0133, "Vegetarian": -0.3195}

    # Intercept = 93.185 kg (baseline footprint)
    # 1. Transport contribution
    transport_contrib = (dist * 0.0861) + mode_coefs.get(mode, 0.0) + fuel_coefs.get(fuel, 0.0)
    # 2. Flights contribution
    flights_contrib = flights * 1.2960
    # 3. Electricity contribution
    elec_contrib = elec * 0.6809
    # 4. Diet contribution
    diet_contrib = diet_coefs.get(diet, 0.0)
    # 5. Waste contribution
    waste_contrib = (organic * 0.0743) + (plastic * -0.5258)
    # 6. Water contribution
    water_contrib = water * -0.0113
    # 7. Trees offset
    trees_contrib = trees * 0.0142

    # Return values in kg, rounded to 2 decimals
    return {
        "Transport": round(transport_contrib, 2),
        "Electricity": round(elec_contrib, 2),
        "Diet": round(diet_contrib, 2),
        "Flights": round(flights_contrib, 2),
        "Waste": round(waste_contrib, 2),
        "Water": round(water_contrib, 2),
        "Trees": round(trees_contrib, 2),
        "Baseline": round(93.1853, 2)
    }



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

