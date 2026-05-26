from typing import List, Dict, Any

def compute_rolling_average(values: List[float], window: int) -> List[float]:
    """
    Computes standard rolling average over a specified window.
    If the history is shorter than the window, averages over available history.
    """
    averages = []
    for idx in range(len(values)):
        start_idx = max(0, idx - window + 1)
        sub_list = values[start_idx:idx + 1]
        averages.append(sum(sub_list) / len(sub_list))
    return averages

def calculate_acwr_zone(acwr: float) -> str:
    """
    Categorizes the Acute:Chronic Workload Ratio into safety zones.
    """
    if acwr < 0.8:
        return "Under-training"
    elif 0.8 <= acwr <= 1.3:
        return "Sweet Spot"
    elif 1.3 < acwr <= 1.5:
        return "Buffer Zone"
    else: # > 1.5
        return "Danger Zone"

def enrich_athlete_history(history: List[Dict[str, Any]], hrv_base: float) -> List[Dict[str, Any]]:
    """
    Enriches the generated raw smartwatch history logs with computed training load metrics:
    - Session Loads (duration * RPE computed dynamically)
    - Acute Workload (rolling 7-day average of daily loads)
    - Chronic Workload (rolling 28-day average of daily loads)
    - ACWR (Acute:Chronic Workload Ratio)
    - ACWR Zone categorization
    - Normalized HRV and Sleep Scores
    - Weighted Recovery/Readiness Index (0 - 100%)
    """
    daily_loads = [sum(w["duration_min"] * w["rpe"] for w in day.get("workouts", [])) for day in history]
    
    # Compute rolling averages
    acute_workloads = compute_rolling_average(daily_loads, window=7)
    chronic_workloads = compute_rolling_average(daily_loads, window=28)
    
    enriched_history = []
    
    for idx, day in enumerate(history):
        enriched_day = day.copy()
        
        acute = acute_workloads[idx]
        chronic = chronic_workloads[idx]
        
        # Calculate ACWR
        acwr = 1.0
        if chronic > 0:
            acwr = round(acute / chronic, 2)
        elif acute > 0:
            acwr = 1.0 # default to baseline if chronic is empty but training occurred
            
        acwr_zone = calculate_acwr_zone(acwr)
        
        # Normalize Sleep Score (we already generate sleep_quality in pipeline, e.g. 0-100)
        sleep_quality = day["sleep_quality"]
        
        # Normalize HRV Score relative to athlete base
        # HRV fluctuates. 80-120% of base is great, lower is fatigued.
        hrv_ratio = day["hrv"] / hrv_base
        hrv_score = min(100, max(0, int(hrv_ratio * 80)))
        
        # ACWR Deviation Penalty: if training load is out of the sweet spot, apply penalty to readiness
        acwr_penalty = 0.0
        if acwr > 1.5: # Danger zone
            acwr_penalty = (acwr - 1.5) * 50.0 # Heavy penalty
        elif acwr < 0.8: # Under-training
            acwr_penalty = (0.8 - acwr) * 20.0 # Minor recovery penalty
            
        # Calculate weighted athlete recovery readiness score
        readiness_score = int(round(
            0.45 * sleep_quality + 
            0.45 * hrv_score - 
            acwr_penalty
        ))
        # Clamp between 0 and 100
        readiness_score = max(0, min(100, readiness_score))
        
        # Enrich the dictionary
        enriched_day["daily_load"] = daily_loads[idx]
        enriched_day["acute_workload"] = round(acute, 1)
        enriched_day["chronic_workload"] = round(chronic, 1)
        enriched_day["acwr"] = acwr
        enriched_day["acwr_zone"] = acwr_zone
        enriched_day["hrv_score"] = hrv_score
        enriched_day["readiness_score"] = readiness_score
        
        enriched_history.append(enriched_day)
        
    return enriched_history

def get_current_athlete_summary(enriched_history: List[Dict[str, Any]], athlete_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts the latest metrics from the enriched history to show on global/summary dashboards.
    """
    if not enriched_history:
        return {}
        
    latest_day = enriched_history[-1]
    
    # Calculate averages over the entire 45 day window to show summary stats
    total_workouts = sum(len(day["workouts"]) for day in enriched_history)
    avg_hrv = sum(day["hrv"] for day in enriched_history) / len(enriched_history)
    avg_sleep_quality = sum(day["sleep_quality"] for day in enriched_history) / len(enriched_history)
    avg_acwr = sum(day["acwr"] for day in enriched_history) / len(enriched_history)
    
    return {
        "id": athlete_profile["id"],
        "name": athlete_profile["name"],
        "sport": athlete_profile["sport"],
        "age": athlete_profile["age"],
        "weight_kg": athlete_profile["weight_kg"],
        "bio": athlete_profile["bio"],
        "current_status": {
            "date": latest_day["date"],
            "resting_hr": latest_day["resting_hr"],
            "hrv": latest_day["hrv"],
            "sleep_duration": latest_day["sleep_duration"],
            "sleep_quality": latest_day["sleep_quality"],
            "steps": latest_day["steps"],
            "active_calories": latest_day["active_calories"],
            "daily_load": latest_day["daily_load"],
            "acute_workload": latest_day["acute_workload"],
            "chronic_workload": latest_day["chronic_workload"],
            "acwr": latest_day["acwr"],
            "acwr_zone": latest_day["acwr_zone"],
            "readiness_score": latest_day["readiness_score"]
        },
        "averages": {
            "total_workouts": total_workouts,
            "avg_hrv": round(avg_hrv, 1),
            "avg_sleep_quality": round(avg_sleep_quality, 1),
            "avg_acwr": round(avg_acwr, 2)
        }
    }
