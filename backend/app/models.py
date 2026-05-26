from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class WorkoutSchema(BaseModel):
    type: str = Field(..., description="Type of workout (Match Play, Tactical Session, Conditioning Split, Gym/Strength)")
    duration_min: int = Field(..., gt=0, description="Duration in minutes")
    avg_hr: int = Field(..., gt=30, description="Average heart rate during workout")
    max_hr: int = Field(..., gt=30, description="Max heart rate during workout")
    rpe: int = Field(..., ge=1, le=10, description="Rating of Perceived Exertion (1 to 10)")

class LiveTickRequest(BaseModel):
    workout_type: str = Field(..., description="Active workout type to simulate")
    elapsed_seconds: int = Field(..., ge=0, description="Elapsed time in seconds for the workout")

class LiveTickResponse(BaseModel):
    athlete_id: str
    elapsed_seconds: int
    heart_rate: int
    steps: int
    active_calories: int
    timestamp: str

class APIKeyRequest(BaseModel):
    api_key: str = Field(..., description="Google Gemini API Key")

class AIInsightsResponse(BaseModel):
    markdown: str = Field(..., description="Rich Markdown performance report from the AI Coach")
