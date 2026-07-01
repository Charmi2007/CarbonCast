from pydantic import BaseModel, Field
from datetime import datetime

class FootprintInput(BaseModel):
    transport_km: float = Field(..., ge=0)
    electricity_kwh: float = Field(..., ge=0)
    meat_meals: float = Field(..., ge=0)
    flights: float = Field(..., ge=0)
    shopping: float = Field(..., ge=0)

class SimulateInput(FootprintInput):
    transport_reduction_pct: float = Field(0, ge=0, le=100)
    electricity_reduction_pct: float = Field(0, ge=0, le=100)
    meat_reduction_pct: float = Field(0, ge=0, le=100)
    flights_reduction_pct: float = Field(0, ge=0, le=100)
    shopping_reduction_pct: float = Field(0, ge=0, le=100)

class GoalInput(FootprintInput):
    target_reduction_pct: float = Field(..., ge=0, le=100)

class HistoryOut(BaseModel):
    id: str
    timestamp: datetime
    transport_km: float
    electricity_kwh: float
    meat_meals: float
    flights: float
    shopping: float
    prediction: float
    carbon_score: float
    category: str

    class Config:
        from_attributes = True
        populate_by_name = True
