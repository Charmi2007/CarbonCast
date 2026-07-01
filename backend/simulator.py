from predictor import predict_footprint, carbon_score


def what_if_simulation(model, data: dict) -> dict:
    base_input = {k: data[k] for k in ["transport_km", "electricity_kwh", "meat_meals", "flights", "shopping"]}
    original_pred = predict_footprint(model, base_input)

    reduced = {
        "transport_km": base_input["transport_km"] * (1 - data.get("transport_reduction_pct", 0) / 100),
        "electricity_kwh": base_input["electricity_kwh"] * (1 - data.get("electricity_reduction_pct", 0) / 100),
        "meat_meals": base_input["meat_meals"] * (1 - data.get("meat_reduction_pct", 0) / 100),
        "flights": base_input["flights"] * (1 - data.get("flights_reduction_pct", 0) / 100),
        "shopping": base_input["shopping"] * (1 - data.get("shopping_reduction_pct", 0) / 100),
    }
    new_pred = predict_footprint(model, reduced)
    reduction = original_pred - new_pred
    return {
        "original_prediction": round(original_pred, 2),
        "new_prediction": round(new_pred, 2),
        "reduction": round(reduction, 2),
        "new_score": round(carbon_score(new_pred), 2),
    }


def goal_tracker(model, data: dict) -> dict:
    base_input = {k: data[k] for k in ["transport_km", "electricity_kwh", "meat_meals", "flights", "shopping"]}
    current_pred = predict_footprint(model, base_input)
    target_pred = current_pred * (1 - data["target_reduction_pct"] / 100)
    progress = max(0, current_pred - target_pred)
    remaining = max(0, target_pred)
    goal_pct = data["target_reduction_pct"]
    return {
        "current_prediction": round(current_pred, 2),
        "target_prediction": round(target_pred, 2),
        "current_progress": round(progress, 2),
        "remaining_reduction": round(remaining, 2),
        "goal_percentage": goal_pct,
    }
