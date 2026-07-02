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


class UserSignup(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str

class AuthResponse(BaseModel):
    status: str
    token: str
    user: UserOut

class SyncGuestInput(BaseModel):
    record_ids: list[str]


class PostInput(BaseModel):
    text: str = Field(..., min_length=2, max_length=280)
    category: str
    carbon_saved: float = Field(0.0, ge=0)

class PostOut(BaseModel):
    id: str
    user_id: str
    user_name: str
    text: str
    category: str
    carbon_saved: float
    timestamp: datetime



