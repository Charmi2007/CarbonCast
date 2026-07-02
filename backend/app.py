import os
import logging
from datetime import datetime
from bson import ObjectId
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load env variables before other imports
load_dotenv()

from database import get_db
from schemas import FootprintInput, SimulateInput, GoalInput, HistoryOut
import predictor
import analytics
import simulator
import recommendations as rec_module
import report as report_module

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("carboncast")

app = FastAPI(title="CarbonCast", description="AI Powered Carbon Footprint Estimator (FastAPI/MongoDB Backend)", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin (e.g. ["http://localhost:5173"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

model = None


@app.on_event("startup")
def startup_event():
    global model
    for folder in ["static", "reports", "models"]:
        os.makedirs(folder, exist_ok=True)
    model = predictor.load_or_train_model()
    logger.info("CarbonCast FastAPI/MongoDB Backend Started")
    print("CarbonCast FastAPI/MongoDB Backend Started")


def _full_assessment(data: dict):
    prediction = predictor.predict_footprint(model, data)
    score = predictor.carbon_score(prediction)
    category = predictor.carbon_category(score)
    breakdown_pct, breakdown_raw = predictor.emission_breakdown(data)
    insights = analytics.build_insights(breakdown_pct, prediction, score, category)
    recs = rec_module.generate_recommendations(breakdown_pct)
    monthly = analytics.monthly_analytics(prediction)
    return prediction, score, category, breakdown_pct, breakdown_raw, insights, recs, monthly


def _map_frontend_to_predictor(data: dict) -> dict:
    home = data.get("home", {})
    transport = data.get("transportation", {})
    food = data.get("food", {})
    lifestyle = data.get("lifestyle", {})

    weekly_distance = float(transport.get("weeklyDistance") or 0)
    electricity_bill = float(home.get("electricityBill") or 0)
    ac_count = float(home.get("acCount") or 0)
    ac_usage_daily = float(home.get("acUsageDaily") or 0)
    chicken_meals_weekly = float(food.get("chickenMealsWeekly") or 0)
    red_meat_meals_monthly = float(food.get("redMeatMealsMonthly") or 0)
    online_shopping_monthly = float(lifestyle.get("onlineShoppingMonthly") or 0)
    new_clothes_monthly = float(lifestyle.get("newClothesMonthly") or 0)
    plastic_bottles_weekly = float(lifestyle.get("plasticBottlesWeekly") or 0)

    # Conversion logic matching synthetic dataset ranges (legacy keys)
    transport_km = weekly_distance / 7.0
    electricity_kwh = (electricity_bill / 4.5) + (ac_count * ac_usage_daily * 1.2)
    meat_meals = chicken_meals_weekly + (red_meat_meals_monthly * 12.0 / 52.0)
    flights = float(transport.get("flightsYearly") or 0)
    shopping = online_shopping_monthly * 10.0 + new_clothes_monthly * 15.0 + plastic_bottles_weekly * 2.0

    # Real dataset mappings
    # 1. Transport_Mode
    pt = transport.get("primaryTransport", "Walk")
    if pt == "Metro":
        mode = "Train"
    elif pt == "Cycle":
        mode = "Bike"
    elif pt in ["Car", "Bike", "Train", "Walk", "Bus"]:
        mode = pt
    else:
        mode = "Walk"

    # 2. Distance_km
    distance = weekly_distance

    # 3. Fuel_Type
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

    # 4. Flight_Trips
    flights_val = flights

    # 5. Diet_Type
    diet_pref = food.get("diet", "Mixed")
    if diet_pref == "Vegan":
        diet = "Vegan"
    elif diet_pref in ["Vegetarian", "Eggetarian"]:
        diet = "Vegetarian"
    else:
        diet = "Mixed"

    # 6. Electricity_kWh
    elec_kwh = electricity_kwh

    # 7. Organic_Waste_kg (default to mean)
    organic = float(lifestyle.get("organicWaste") or lifestyle.get("organic_waste") or 13.0)

    # 8. Plastic_Waste_kg (estimate from plasticBottlesWeekly if not provided)
    plastic = float(lifestyle.get("plasticWaste") or lifestyle.get("plastic_waste") or min(max(plastic_bottles_weekly * 0.5, 0.0), 10.0))

    # 9. Water_Liters (default to mean)
    water = float(lifestyle.get("waterUsage") or lifestyle.get("water_liters") or 336.0)

    # 10. Trees_Planted
    trees = float(lifestyle.get("treesPlanted") or lifestyle.get("trees_planted") or 0.0)

    return {
        # Legacy keys for backward compatibility, simulator, emission breakdown, etc.
        "transport_km": max(0.0, transport_km),
        "electricity_kwh": max(0.0, electricity_kwh),
        "meat_meals": max(0.0, meat_meals),
        "flights": max(0.0, flights),
        "shopping": max(0.0, shopping),
        
        # Real dataset features for the ML model
        "Transport_Mode": mode,
        "Distance_km": distance,
        "Fuel_Type": fuel,
        "Flight_Trips": flights_val,
        "Diet_Type": diet,
        "Electricity_kWh": elec_kwh,
        "Organic_Waste_kg": organic,
        "Plastic_Waste_kg": plastic,
        "Water_Liters": water,
        "Trees_Planted": trees
    }


def _get_badge(rank: int, category: str) -> str:
    if rank == 1:
        return "🌍 Planet Protector"
    elif rank == 2:
        return "🌳 Sustainability Champion"
    elif rank == 3:
        return "🌿 Green Citizen"
    else:
        return "🌱 Eco Beginner" if category in ["Low", "Moderate"] else "⚠️ Carbon Heavy"


# ==============================================================================
# FRONTEND COMPATIBLE ENDPOINTS (mounted at /api/v1)
# ==============================================================================

@app.get("/api/v1/health")
def api_health():
    return {"status": "success", "message": "API is running smoothly.", "model_loaded": model is not None}


@app.get("/api/v1/model-info")
def api_get_model_info():
    import json
    report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "training_report.json")
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Model training report not found")
    with open(report_path, "r") as f:
        report = json.load(f)
    return {
        "status": "success",
        "data": report
    }


@app.post("/api/v1/calculate")
def api_calculate(payload: dict):
    try:
        db = get_db()
        mapped_data = _map_frontend_to_predictor(payload)
        prediction, score, category, breakdown_pct, breakdown_raw, insights, recs, monthly = _full_assessment(mapped_data)

        # Scale outputs for the frontend expectation (tonnes CO2, Moderate category, 0-1 breakdown fraction)
        total_carbon_footprint = round(prediction / 1000.0, 2)
        carbon_score_val = round(score)
        category_mapped = "Moderate" if category == "Medium" else category

        breakdown_transportation = breakdown_pct.get("Transport", 0) / 100.0
        breakdown_electricity = breakdown_pct.get("Electricity", 0) / 100.0
        breakdown_food = breakdown_pct.get("Food", 0) / 100.0
        breakdown_lifestyle = breakdown_pct.get("Shopping", 0) / 100.0

        # AI/ML explainability additions
        import math
        z = (prediction - 271.72) / 80.87
        percentile_val = 100 - (100 * (0.5 * (1.0 + math.erf(z / math.sqrt(2.0)))))
        percentile = round(max(1.0, min(99.0, percentile_val)), 1)

        equivalents = {
            "km_driven": int(round(total_carbon_footprint * 4023)),
            "phones_charged": int(round(total_carbon_footprint * 121643)),
            "tree_offset": int(round(total_carbon_footprint * 45))
        }

        explanation = predictor.explain_prediction(mapped_data)

        document = {
            "personal": payload.get("personal", {}),
            "home": payload.get("home", {}),
            "transportation": payload.get("transportation", {}),
            "food": payload.get("food", {}),
            "lifestyle": payload.get("lifestyle", {}),
            "mapped_inputs": {
                **mapped_data,
                "prediction": prediction
            },
            "results": {
                "totalCarbonFootprint": total_carbon_footprint,
                "carbonScore": carbon_score_val,
                "category": category_mapped,
                "breakdown": {
                    "transportation": breakdown_transportation,
                    "electricity": breakdown_electricity,
                    "food": breakdown_food,
                    "lifestyle": breakdown_lifestyle
                },
                "recommendations": recs,
                "percentile": percentile,
                "equivalents": equivalents,
                "ai_explanation": explanation
            },
            "createdAt": datetime.utcnow()
        }

        result = db.records.insert_one(document)
        record_id = str(result.inserted_id)

        # Generate report & charts
        charts = report_module.generate_charts(breakdown_raw, monthly)
        report_module.generate_pdf_report(record_id, prediction, score, category_mapped, insights, recs, charts)

        # Return standard response format
        return {
            "status": "success",
            "data": {
                "record": {
                    "_id": record_id,
                    "personal": document["personal"],
                    "home": document["home"],
                    "transportation": document["transportation"],
                    "food": document["food"],
                    "lifestyle": document["lifestyle"],
                    "results": document["results"]
                }
            }
        }
    except Exception as e:
        logger.exception("Calculation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/results/{record_id}")
def api_get_result(record_id: str):
    db = get_db()
    try:
        query_id = ObjectId(record_id)
    except Exception:
        query_id = record_id

    doc = db.records.find_one({"_id": query_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Record not found")

    doc["_id"] = str(doc["_id"])
    return {
        "status": "success",
        "data": {
            "record": doc
        }
    }


@app.get("/api/v1/leaderboard")
def api_get_leaderboard():
    db = get_db()
    # Find all records with user name
    docs = db.records.find({"personal.name": {"$ne": None, "$ne": ""}}).sort("results.carbonScore", -1).limit(10)
    
    leaderboard = []
    rank = 1
    for doc in docs:
        results = doc.get("results") or {}
        leaderboard.append({
            "rank": rank,
            "user": doc["personal"].get("name") or "Anonymous",
            "score": results.get("carbonScore") or 50,
            "category": results.get("category") or "Moderate",
            "badge": _get_badge(rank, results.get("category") or "Moderate")
        })
        rank += 1

    # Pad with default mock entries if database is empty/small
    if len(leaderboard) < 4:
        mock_entries = [
            {"rank": 1, "user": "EcoWarrior", "score": 95, "category": "Low", "badge": "🌍 Planet Protector"},
            {"rank": 2, "user": "GreenLife", "score": 90, "category": "Low", "badge": "🌳 Sustainability Champion"},
            {"rank": 3, "user": "Jane Doe", "score": 85, "category": "Low", "badge": "🌿 Green Citizen"},
            {"rank": 4, "user": "John S", "score": 70, "category": "Moderate", "badge": "🌱 Eco Beginner"}
        ]
        for entry in mock_entries:
            if not any(x["user"] == entry["user"] for x in leaderboard):
                leaderboard.append(entry)
        
        # Sort and re-rank
        leaderboard.sort(key=lambda x: x["score"], reverse=True)
        for idx, entry in enumerate(leaderboard):
            entry["rank"] = idx + 1
            entry["badge"] = _get_badge(idx + 1, entry["category"])

    return {
        "status": "success",
        "data": {
            "leaderboard": leaderboard
        }
    }


@app.get("/api/v1/tips")
def api_get_tips():
    tips = [
        { "id": 1, "category": "Energy", "title": "Switch to LEDs", "description": "Replace incandescent bulbs with LEDs to save up to 80% on lighting energy.", "saving": "150kg CO₂/yr" },
        { "id": 2, "category": "Transportation", "title": "Carpooling", "description": "Share a ride to work twice a week to significantly cut down emissions.", "saving": "300kg CO₂/yr" },
        { "id": 3, "category": "Food", "title": "Meatless Mondays", "description": "Skipping meat one day a week can have a massive environmental impact.", "saving": "100kg CO₂/yr" },
        { "id": 4, "category": "Recycling", "title": "Compost Waste", "description": "Compost organic waste to reduce methane emissions from landfills.", "saving": "50kg CO₂/yr" },
        { "id": 5, "category": "Shopping", "title": "Buy Local", "description": "Purchase locally sourced goods to reduce transportation emissions.", "saving": "75kg CO₂/yr" }
    ]
    return {
        "status": "success",
        "data": {
            "tips": tips
        }
    }


@app.post("/api/v1/contact")
def api_submit_contact(payload: dict):
    db = get_db()
    name = payload.get("name")
    email = payload.get("email")
    message = payload.get("message")

    if not name or not email or not message:
        raise HTTPException(status_code=400, detail="Please provide name, email, and message")

    db.contacts.insert_one({
        "name": name,
        "email": email,
        "message": message,
        "submittedAt": datetime.utcnow()
    })

    return {
        "status": "success",
        "message": "Thank you! Your message has been received."
    }


@app.get("/api/v1/report/{record_id}")
def api_download_report(record_id: str):
    path = f"reports/report_{record_id}.pdf"
    if not os.path.exists(path):
        # Regenerate report on demand if the file was deleted but the record exists in MongoDB
        db = get_db()
        try:
            query_id = ObjectId(record_id)
        except Exception:
            query_id = record_id
        
        doc = db.records.find_one({"_id": query_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Report not found")
        
        mapped_inputs = doc.get("mapped_inputs", {})
        prediction, score, category, breakdown_pct, breakdown_raw, insights, recs, monthly = _full_assessment(mapped_inputs)
        charts = report_module.generate_charts(breakdown_raw, monthly)
        report_module.generate_pdf_report(record_id, prediction, score, category, insights, recs, charts)
        
    return FileResponse(path, media_type="application/pdf", filename=f"carboncast_report_{record_id}.pdf")


# ==============================================================================
# ORIGINAL BACKWARD-COMPATIBLE ROUTES (from root app.py)
# ==============================================================================

@app.get("/")
def root():
    return {"message": "Welcome to CarbonCast - AI Powered Carbon Footprint Estimator"}


@app.get("/health")
def health():
    db = get_db()
    # Check if fallback is active
    from database import use_fallback
    return {
        "status": "ok", 
        "model_loaded": model is not None, 
        "timestamp": datetime.utcnow().isoformat(),
        "database": "Fallback (In-Memory)" if use_fallback else "MongoDB"
    }


@app.post("/predict")
def predict(payload: FootprintInput):
    try:
        db = get_db()
        data = payload.dict()
        prediction, score, category, breakdown_pct, breakdown_raw, insights, recs, monthly = _full_assessment(data)

        # Store in MongoDB to keep history synced
        total_carbon_footprint = round(prediction / 1000.0, 2)
        carbon_score_val = round(score)
        category_mapped = "Moderate" if category == "Medium" else category
        breakdown_transportation = breakdown_pct.get("Transport", 0) / 100.0
        breakdown_electricity = breakdown_pct.get("Electricity", 0) / 100.0
        breakdown_food = breakdown_pct.get("Food", 0) / 100.0
        breakdown_lifestyle = breakdown_pct.get("Shopping", 0) / 100.0

        # AI/ML explainability additions
        import math
        z = (prediction - 271.72) / 80.87
        percentile_val = 100 - (100 * (0.5 * (1.0 + math.erf(z / math.sqrt(2.0)))))
        percentile = round(max(1.0, min(99.0, percentile_val)), 1)

        equivalents = {
            "km_driven": int(round(total_carbon_footprint * 4023)),
            "phones_charged": int(round(total_carbon_footprint * 121643)),
            "tree_offset": int(round(total_carbon_footprint * 45))
        }

        explanation = predictor.explain_prediction(data)

        document = {
            "personal": {"name": "Anonymous", "age": 0},
            "home": {
                "homeType": "Apartment",
                "peopleCount": 1,
                "electricityBill": data["electricity_kwh"] * 4.5,
                "acCount": 0,
                "acUsageDaily": 0
            },
            "transportation": {
                "primaryTransport": "Car",
                "weeklyDistance": data["transport_km"] * 7,
                "flightsYearly": data["flights"]
            },
            "food": {
                "diet": "Non-Vegetarian",
                "chickenMealsWeekly": data["meat_meals"],
                "redMeatMealsMonthly": 0
            },
            "lifestyle": {
                "onlineShoppingMonthly": data["shopping"] / 10,
                "newClothesMonthly": 0,
                "plasticBottlesWeekly": 0
            },
            "mapped_inputs": {
                **data,
                "prediction": prediction
            },
            "results": {
                "totalCarbonFootprint": total_carbon_footprint,
                "carbonScore": carbon_score_val,
                "category": category_mapped,
                "breakdown": {
                    "transportation": breakdown_transportation,
                    "electricity": breakdown_electricity,
                    "food": breakdown_food,
                    "lifestyle": breakdown_lifestyle
                },
                "recommendations": recs,
                "percentile": percentile,
                "equivalents": equivalents,
                "ai_explanation": explanation
            },
            "createdAt": datetime.utcnow()
        }

        result = db.records.insert_one(document)
        record_id = str(result.inserted_id)

        charts = report_module.generate_charts(breakdown_raw, monthly)
        report_module.generate_pdf_report(record_id, prediction, score, category_mapped, insights, recs, charts)

        return {
            "id": record_id,
            "prediction": round(prediction, 2),
            "carbon_score": round(score, 2),
            "category": category,
            "breakdown": breakdown_pct,
            "insights": insights,
            "recommendations": recs,
            "monthly_trend": monthly,
            "charts": charts,
            "percentile": percentile,
            "equivalents": equivalents,
            "ai_explanation": explanation,
        }
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulate")
def simulate(payload: SimulateInput):
    try:
        return simulator.what_if_simulation(model, payload.dict())
    except Exception as e:
        logger.exception("Simulation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/goal")
def goal(payload: GoalInput):
    try:
        return simulator.goal_tracker(model, payload.dict())
    except Exception as e:
        logger.exception("Goal tracking failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history", response_model=list[HistoryOut])
def history():
    db = get_db()
    docs = db.records.find().sort("_id", -1)
    results = []
    for doc in docs:
        mapped_inputs = doc.get("mapped_inputs") or {}
        results_field = doc.get("results") or {}
        pred_val = mapped_inputs.get("prediction") or (results_field.get("totalCarbonFootprint", 0) * 1000.0)
        results.append(HistoryOut(
            id=str(doc["_id"]),
            timestamp=doc.get("createdAt") or datetime.utcnow(),
            transport_km=mapped_inputs.get("transport_km") or 0.0,
            electricity_kwh=mapped_inputs.get("electricity_kwh") or 0.0,
            meat_meals=mapped_inputs.get("meat_meals") or 0.0,
            flights=mapped_inputs.get("flights") or 0.0,
            shopping=mapped_inputs.get("shopping") or 0.0,
            prediction=pred_val,
            carbon_score=results_field.get("carbonScore") or 50.0,
            category=results_field.get("category") or "Moderate"
        ))
    return results


@app.delete("/history")
def delete_history():
    db = get_db()
    result = db.records.delete_many({})
    return {"deleted_records": result.deleted_count}


@app.get("/dashboard")
def dashboard():
    db = get_db()
    latest = db.records.find_one(sort=[("_id", -1)])
    if not latest:
        raise HTTPException(status_code=404, detail="No history found. Call /predict first.")
    mapped_inputs = latest.get("mapped_inputs") or {}
    data = {
        "transport_km": mapped_inputs.get("transport_km") or 0.0,
        "electricity_kwh": mapped_inputs.get("electricity_kwh") or 0.0,
        "meat_meals": mapped_inputs.get("meat_meals") or 0.0,
        "flights": mapped_inputs.get("flights") or 0.0,
        "shopping": mapped_inputs.get("shopping") or 0.0,
    }
    prediction, score, category, breakdown_pct, breakdown_raw, insights, recs, monthly = _full_assessment(data)
    charts = report_module.generate_charts(breakdown_raw, monthly)
    
    # fetch latest 20 history records
    history_docs = db.records.find().sort("_id", -1).limit(20)
    history_records = []
    for doc in history_docs:
        m_in = doc.get("mapped_inputs") or {}
        res_f = doc.get("results") or {}
        pred_val = m_in.get("prediction") or (res_f.get("totalCarbonFootprint", 0) * 1000.0)
        history_records.append({
            "id": str(doc["_id"]),
            "timestamp": doc.get("createdAt") or datetime.utcnow(),
            "transport_km": m_in.get("transport_km") or 0.0,
            "electricity_kwh": m_in.get("electricity_kwh") or 0.0,
            "meat_meals": m_in.get("meat_meals") or 0.0,
            "flights": m_in.get("flights") or 0.0,
            "shopping": m_in.get("shopping") or 0.0,
            "prediction": pred_val,
            "carbon_score": res_f.get("carbonScore") or 50.0,
            "category": res_f.get("category") or "Moderate"
        })
        
    return {
        "prediction": round(prediction, 2),
        "score": round(score, 2),
        "category": category,
        "breakdown": breakdown_pct,
        "insights": insights,
        "recommendations": recs,
        "monthly_trend": monthly,
        "history": history_records,
        "charts": charts,
    }


@app.get("/charts")
def get_charts():
    paths = {
        "bar_chart": report_module.BAR_PATH,
        "pie_chart": report_module.PIE_PATH,
        "line_chart": report_module.LINE_PATH,
    }
    existing = {k: v for k, v in paths.items() if os.path.exists(v)}
    if not existing:
        raise HTTPException(status_code=404, detail="No charts generated yet. Call /predict first.")
    return JSONResponse(existing)
