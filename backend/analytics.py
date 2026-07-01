import numpy as np


def build_insights(breakdown_pct: dict, prediction: float, score: float, category: str) -> dict:
    highest = max(breakdown_pct, key=breakdown_pct.get)
    lowest = min(breakdown_pct, key=breakdown_pct.get)
    return {
        "highest_emission_source": highest,
        "lowest_emission_source": lowest,
        "average_emission": round(prediction / 4, 2),
        "emission_percentages": breakdown_pct,
        "carbon_score": round(score, 2),
        "category": category,
    }


def monthly_analytics(prediction: float) -> dict:
    rng = np.random.default_rng(int(prediction) % 1000 + 1)
    base = prediction / 12
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    values = (base * rng.uniform(0.85, 1.15, 12)).round(2)
    trend = "increasing" if values[-1] > values[0] else "decreasing"
    data = dict(zip(months, values.tolist()))
    return {
        "monthly_prediction": data,
        "trend": trend,
        "highest_month": max(data, key=data.get),
        "lowest_month": min(data, key=data.get),
        "average_month": round(float(np.mean(values)), 2),
    }
