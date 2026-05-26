import os
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import datetime

# Import modules from our package
from app.data_pipeline import ATHLETE_PROFILES, generate_athlete_history, get_live_tick_data
from app.formulas import enrich_athlete_history, get_current_athlete_summary
from app.insights_llm import generate_local_insights, generate_gemini_insights
from app.models import WorkoutSchema, LiveTickRequest, LiveTickResponse, AIInsightsResponse

app = FastAPI(
    title="Athlete Training Load & Smartwatch API",
    description="Python backend managing synthetic smartwatch streams, training load metrics (ACWR), and AI Coaching feedback.",
    version="1.0.0"
)

# Configure CORS so React (Vite) on port 5173 can access the resources
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Database to store the active state of athletes
# Generated once when server launches, persistent in memory
ATHLETE_DATA_STORE: Dict[str, List[Dict[str, Any]]] = {}

# Initialize the Data Store
def initialize_database():
    print("[DB] Initializing In-Memory Athlete Database...")
    for athlete_id, profile in ATHLETE_PROFILES.items():
        # Generate 45 days of raw synthetic data
        raw_history = generate_athlete_history(athlete_id, days=45)
        # Enrich history with acute load, chronic load, ACWR, and recovery scores
        enriched_history = enrich_athlete_history(raw_history, hrv_base=profile["hrv_base"])
        ATHLETE_DATA_STORE[athlete_id] = enriched_history
    print("[DB] Athlete Database Successfully Loaded!")

@app.on_event("startup")
def startup_event():
    initialize_database()

# --- API ENDPOINTS ---

@app.get("/api/athletes", description="Returns active roster summary of all athletes.")
def get_athletes():
    summaries = []
    for athlete_id, profile in ATHLETE_PROFILES.items():
        history = ATHLETE_DATA_STORE.get(athlete_id)
        if not history:
            continue
        summary = get_current_athlete_summary(history, profile)
        summaries.append(summary)
    return summaries

@app.get("/api/athletes/{athlete_id}/history", description="Returns the 45-day detailed smartwatch timeseries for charts.")
def get_athlete_history(athlete_id: str):
    if athlete_id not in ATHLETE_DATA_STORE:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return ATHLETE_DATA_STORE[athlete_id]


HARDCODED_GEMINI_KEY = "AIzaSyBs7gIdXHxJxB3YvOEMjIV1_pu369DxQNI"


BACKGROUND_GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "") or HARDCODED_GEMINI_KEY

@app.get("/api/athletes/{athlete_id}/insights", response_model=AIInsightsResponse, description="Returns LLM-powered or local-heuristic training insights.")
def get_athlete_insights(
    athlete_id: str, 
    x_gemini_key: Optional[str] = Header(None, alias="X-Gemini-Key")
):
    if athlete_id not in ATHLETE_DATA_STORE:
        raise HTTPException(status_code=404, detail="Athlete not found")
        
    history = ATHLETE_DATA_STORE[athlete_id]
    profile = ATHLETE_PROFILES[athlete_id]
    summary = get_current_athlete_summary(history, profile)
    
    # Check background environment key first, fall back to frontend settings header
    api_key = BACKGROUND_GEMINI_KEY or x_gemini_key
    
    if api_key and len(api_key.strip()) > 10:
        print(f"[AI] Invoking LIVE Gemini API Coach for {profile['name']}...")
        return generate_gemini_insights(summary, history, api_key=api_key)
    else:
        print(f"[AI] Invoking Local Offline Coach for {profile['name']}...")
        return generate_local_insights(summary, history)

@app.post("/api/athletes/{athlete_id}/workout", description="Ingests a new workout from simulated smartwatch, updating physical metrics.")
def add_workout(athlete_id: str, workout: WorkoutSchema):
    if athlete_id not in ATHLETE_DATA_STORE:
        raise HTTPException(status_code=404, detail="Athlete not found")
        
    history = ATHLETE_DATA_STORE[athlete_id]
    profile = ATHLETE_PROFILES[athlete_id]
    
    # Calculate the training load for this session
    session_load = workout.duration_min * workout.rpe
    

    today_iso = datetime.date.today().isoformat()
    
    # If the last entry matches today, we append the workout. Otherwise, we roll a new day
    latest_day = history[-1]
    

    new_workout_dict = {
        "id": f"w_live_{len(latest_day.get('workouts', []))}",
        "type": workout.type,
        "duration_min": workout.duration_min,
        "avg_hr": workout.avg_hr,
        "max_hr": workout.max_hr,
        "rpe": workout.rpe
    }
    
    if latest_day["date"] == today_iso:
        # Append workout to today's list
        latest_day["workouts"].append(new_workout_dict)
        latest_day["daily_load"] += session_load
        # Simulate active calories and step increases during the workout
        workout_steps = workout.duration_min * 135 if workout.type in ["Run", "HIIT"] else 0
        latest_day["steps"] += int(workout_steps)
        latest_day["active_calories"] += int(workout.duration_min * (workout.rpe + 1.2))
    else:

        resting_hr = max(35, min(95, latest_day["resting_hr"] + 1))
        hrv = max(15, min(145, latest_day["hrv"] - 5))
        
        new_day = {
            "date": today_iso,
            "weekday": datetime.date.today().weekday(),
            "resting_hr": resting_hr,
            "hrv": hrv,
            "sleep_duration": latest_day["sleep_duration"],
            "sleep_quality": latest_day["sleep_quality"],
            "steps": int(8000 + (workout.duration_min * 135 if workout.type in ["Run", "HIIT"] else 0)),
            "active_calories": int(400 + (workout.duration_min * (workout.rpe + 1.2))),
            "workouts": [new_workout_dict],
            "daily_load": session_load
        }
        # Slide window (pop oldest historical day to maintain 45-day window)
        history.pop(0)
        history.append(new_day)
        
    # Recalculate training load statistics across the updated history
    recalculated_history = enrich_athlete_history(history, hrv_base=profile["hrv_base"])
    ATHLETE_DATA_STORE[athlete_id] = recalculated_history
    
    # Return updated athlete summary
    return get_current_athlete_summary(recalculated_history, profile)

@app.post("/api/athletes/{athlete_id}/live-tick", response_model=LiveTickResponse, description="Calculates simulated instant watch metrics in real-time.")
def post_live_tick(athlete_id: str, request: LiveTickRequest):
    if athlete_id not in ATHLETE_PROFILES:
        raise HTTPException(status_code=404, detail="Athlete not found")
        
    tick = get_live_tick_data(
        athlete_id=athlete_id, 
        workout_type=request.workout_type, 
        elapsed_seconds=request.elapsed_seconds
    )
    return tick

@app.post("/api/athletes/reset", description="Resets the in-memory database to fresh synthetic sets.")
def reset_database():
    initialize_database()
    return {"status": "success", "message": "In-memory metrics successfully restored to baselines."}
