from datetime import datetime

class UserHistory:
    def __init__(self, **kwargs):
        self.timestamp = kwargs.get("timestamp") or datetime.utcnow()
        self.transport_km = kwargs.get("transport_km")
        self.electricity_kwh = kwargs.get("electricity_kwh")
        self.meat_meals = kwargs.get("meat_meals")
        self.flights = kwargs.get("flights")
        self.shopping = kwargs.get("shopping")
        self.prediction = kwargs.get("prediction")
        self.carbon_score = kwargs.get("carbon_score")
        self.category = kwargs.get("category")

    def to_dict(self):
        return {
            "timestamp": self.timestamp,
            "transport_km": self.transport_km,
            "electricity_kwh": self.electricity_kwh,
            "meat_meals": self.meat_meals,
            "flights": self.flights,
            "shopping": self.shopping,
            "prediction": self.prediction,
            "carbon_score": self.carbon_score,
            "category": self.category
        }
