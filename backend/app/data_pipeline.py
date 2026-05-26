import datetime
import random
import math
from typing import Dict, List, Any

# Define the First-Team Squad Roster with 8 position-specific profiles and highly varied physiological baselines
SQUAD_ROSTER = {
    "1": {
        "id": "1",
        "name": "Marcus Vance",
        "position": "Box-to-Box Midfielder",
        "sport": "Box-to-Box Midfielder",
        "age": 26,
        "weight_kg": 74.0,
        "max_hr": 196,
        "rest_hr_base": 42,
        "hrv_base": 88,
        "sleep_dur_base": 8.0,
        "step_base": 9000,
        "cal_base": 2400,
        "bio": "Central midfielder. Highest aerobic volume in the squad, average distance per match is 12.2km. Highly adapted cardiovascular baseline."
    },
    "2": {
        "id": "2",
        "name": "Sarah Chen",
        "position": "Winger (Sprint Specialist)",
        "sport": "Winger (Sprint Specialist)",
        "age": 24,
        "weight_kg": 62.0,
        "max_hr": 202,
        "rest_hr_base": 46,
        "hrv_base": 80,
        "sleep_dur_base": 8.2,
        "step_base": 8000,
        "cal_base": 2200,
        "bio": "Explosive winger. High frequency of high-speed sprints (>25 km/h). Prone to hamstring fatigue; requires meticulous monitoring of acute load spikes."
    },
    "3": {
        "id": "3",
        "name": "Alex Rivers",
        "position": "Center Back",
        "sport": "Center Back",
        "age": 29,
        "weight_kg": 85.0,
        "max_hr": 188,
        "rest_hr_base": 48,
        "hrv_base": 74,
        "sleep_dur_base": 7.8,
        "step_base": 7000,
        "cal_base": 2300,
        "bio": "Defensive anchor. High physical loading from defensive duals, shielding, and aerial battles. Solid cardiovascular baseline with moderate sleep fluctuations."
    },
    "4": {
        "id": "4",
        "name": "Elena Rostova",
        "position": "Explosive Striker",
        "sport": "Explosive Striker",
        "age": 27,
        "weight_kg": 66.5,
        "max_hr": 194,
        "rest_hr_base": 45,
        "hrv_base": 82,
        "sleep_dur_base": 8.0,
        "step_base": 7500,
        "cal_base": 2300,
        "bio": "Starting center-forward. Excels in rapid acceleration bursts, clinical finishing, and pressing defenders. Prone to overreaching before tactical tapers."
    },
    "5": {
        "id": "5",
        "name": "Jordan Kalu",
        "position": "Goalkeeper",
        "sport": "Goalkeeper",
        "age": 28,
        "weight_kg": 88.0,
        "max_hr": 185,
        "rest_hr_base": 52,
        "hrv_base": 68,
        "sleep_dur_base": 8.3,
        "step_base": 4500,
        "cal_base": 2000,
        "bio": "Starting goalkeeper. Low total steps/distance, but high explosive diving and reaction loads. Average HR is lower, resting biometrics are highly consistent."
    },
    "6": {
        "id": "6",
        "name": "Lucas Silva",
        "position": "Attacking Midfielder",
        "sport": "Attacking Midfielder",
        "age": 25,
        "weight_kg": 71.0,
        "max_hr": 198,
        "rest_hr_base": 44,
        "hrv_base": 85,
        "sleep_dur_base": 8.0,
        "step_base": 8500,
        "cal_base": 2300,
        "bio": "Playmaker returning from a long-term knee injury. Rushed back too quickly into competitive match volumes. Currently experiencing severe overtraining strain."
    },
    "7": {
        "id": "7",
        "name": "Kai Tanaka",
        "position": "Left Fullback",
        "sport": "Left Fullback",
        "age": 23,
        "weight_kg": 68.0,
        "max_hr": 200,
        "rest_hr_base": 48,
        "hrv_base": 78,
        "sleep_dur_base": 7.5,
        "step_base": 8500,
        "cal_base": 2200,
        "bio": "Energetic left back. Currently suffering from severe chronic insomnia and sleep debt, leading to compressed physiological reserves and autonomic fatigue."
    },
    "8": {
        "id": "8",
        "name": "Tomas Costa",
        "position": "Defensive Midfielder",
        "sport": "Defensive Midfielder",
        "age": 27,
        "weight_kg": 78.0,
        "max_hr": 190,
        "rest_hr_base": 45,
        "hrv_base": 78,
        "sleep_dur_base": 8.0,
        "step_base": 8000,
        "cal_base": 2300,
        "bio": "Defensive destroyer returning from a minor ankle sprain. Muscular tissues are fully healed and rested, but severely detrained after 3 weeks of zero workload."
    }
}

ATHLETE_PROFILES = SQUAD_ROSTER

def generate_athlete_history(player_id: str, days: int = 45) -> List[Dict[str, Any]]:
    """
    Generates realistic 45-day raw smartwatch metrics.
    Specifically models critical fatigue and sleep deprivation states for players 6, 7, and 8.
    """
    profile = SQUAD_ROSTER.get(player_id)
    if not profile:
        raise ValueError(f"Player with ID {player_id} not found.")
    
    random.seed(int(player_id) * 300)
    history = []
    
    # Internal physiology state tracking
    accumulated_fatigue = 0.0
    accumulated_fitness = 0.0
    
    base_date = datetime.date.today() - datetime.timedelta(days=days - 1)
    
    for day_idx in range(days):
        current_date = base_date + datetime.timedelta(days=day_idx)
        weekday = current_date.weekday()
        
        # 1. Sleep Metrics (Raw)
        if player_id == "7": # Kai Tanaka: Chronic severe sleep deprivation
            sleep_variance = random.uniform(-2.8, -1.0)
            sleep_duration = max(4.0, min(6.5, profile["sleep_dur_base"] + sleep_variance))
            sleep_quality = int(random.randint(30, 48))
        else:
            sleep_variance = random.uniform(-1.0, 1.2)
            if weekday == 5:
                sleep_variance -= 1.0
            elif weekday == 4:
                sleep_variance -= 0.4
            sleep_duration = max(5.0, min(10.5, profile["sleep_dur_base"] + sleep_variance))
            sleep_quality = int(max(35, min(100, (sleep_duration / profile["sleep_dur_base"]) * 88 + random.uniform(-8, 8))))
        
        # 2. Cardiac Sensors (Raw)
        # Apply massive physiological fatigue penalties for player 6 (Severe load spike)
        if player_id == "6" and day_idx >= 30: # Last 15 days is extreme overload crash
            fatigue_penalty_rhr = accumulated_fatigue * 7.5 + 4.0 # severe RHR drift
            fatigue_penalty_hrv = accumulated_fatigue * 28.0 + 15.0 # severe HRV compression
        else:
            fatigue_penalty_rhr = accumulated_fatigue * 4.5
            fatigue_penalty_hrv = accumulated_fatigue * 18.0
            
        recovery_bonus_rhr = (sleep_quality - 80) / 12.0
        resting_hr = int(max(34, min(95, profile["rest_hr_base"] + fatigue_penalty_rhr - recovery_bonus_rhr + random.uniform(-1.5, 2))))
        
        recovery_bonus_hrv = (sleep_quality - 75) / 2.5
        hrv = int(max(12, min(130, profile["hrv_base"] - fatigue_penalty_hrv + recovery_bonus_hrv + random.uniform(-4, 4))))
        
        # 3. Workouts Logs (Ingested from Watch Workout app)
        workouts = []
        is_training_or_match = True
        
        # Player 8 (Tomas Costa) is severely detrained: has done absolutely zero training for the last 20 days!
        is_detrained = (player_id == "8" and day_idx >= 25)
        
        if is_detrained or weekday == 6:
            is_training_or_match = False
        elif weekday == 0:
            workouts.append({
                "id": f"w_{day_idx}_0",
                "type": "Recovery Split",
                "duration_min": 30,
                "avg_hr": 105,
                "max_hr": 125,
                "rpe": 2
            })
        elif weekday == 1:
            workouts.append({
                "id": f"w_{day_idx}_0",
                "type": "Tactical Drill",
                "duration_min": 75,
                "avg_hr": 130 if profile["position"] != "Goalkeeper" else 110,
                "max_hr": 160 if profile["position"] != "Goalkeeper" else 135,
                "rpe": 5
            })
        elif weekday == 2:
            is_extreme = (profile["position"] == "Explosive Striker" and 22 <= day_idx <= 29) or (player_id == "6" and day_idx >= 30)
            workouts.append({
                "id": f"w_{day_idx}_0",
                "type": "Conditioning Split",
                "duration_min": 90 if not is_extreme else 120,
                "avg_hr": 155 if profile["position"] != "Goalkeeper" else 125,
                "max_hr": 185 if profile["position"] != "Goalkeeper" else 165,
                "rpe": 8 if not is_extreme else 10 # Maximum metabolic load
            })
        elif weekday == 3:
            workouts.append({
                "id": f"w_{day_idx}_0",
                "type": "Gym/Strength",
                "duration_min": 60,
                "avg_hr": 115 if profile["position"] != "Goalkeeper" else 105,
                "max_hr": 155 if profile["position"] != "Goalkeeper" else 140,
                "rpe": 5
            })
        elif weekday == 4:
            workouts.append({
                "id": f"w_{day_idx}_0",
                "type": "Taper Drill",
                "duration_min": 45,
                "avg_hr": 118 if profile["position"] != "Goalkeeper" else 102,
                "max_hr": 140 if profile["position"] != "Goalkeeper" else 120,
                "rpe": 3
            })
        elif weekday == 5:
            if profile["position"] == "Goalkeeper":
                workouts.append({
                    "id": f"w_{day_idx}_0",
                    "type": "Match Play",
                    "duration_min": 95,
                    "avg_hr": 122,
                    "max_hr": 168,
                    "rpe": 6
                })
            else:
                is_injured_window = (profile["position"] == "Winger (Sprint Specialist)" and 25 <= day_idx <= 30)
                if is_injured_window:
                    is_training_or_match = False
                else:
                    # Player 6 has massive match loads to force ACWR Danger Zone
                    load_multiplier = 1.35 if (player_id == "6" and day_idx >= 30) else 1.0
                    workouts.append({
                        "id": f"w_{day_idx}_0",
                        "type": "Match Play",
                        "duration_min": int(95 * load_multiplier),
                        "avg_hr": 164 if profile["position"] == "Box-to-Box Midfielder" else 158,
                        "max_hr": profile["max_hr"] - random.randint(1, 4),
                        "rpe": 9
                    })
                    
        # Apply fatigue limits (dampened intensity) - EXCEPT for player 6 who overtrains and pushes through!
        if accumulated_fatigue > 1.7 and weekday != 5 and player_id != "6":
            for w in workouts:
                w["duration_min"] = int(w["duration_min"] * 0.75)
                w["rpe"] = max(2, w["rpe"] - 2)
                
        # Calculate daily training load
        daily_training_load = sum(w["duration_min"] * w["rpe"] for w in workouts)
        
        # 4. Activity Trackers (Raw)
        workout_steps = 0
        workout_cals = 0
        
        for w in workouts:
            if w["type"] == "Match Play":
                if profile["position"] in ["Box-to-Box Midfielder", "Attacking Midfielder"]:
                    workout_steps = 14500
                    workout_cals = 1650
                elif profile["position"] in ["Winger (Sprint Specialist)", "Left Fullback"]:
                    workout_steps = 11000
                    workout_cals = 1400
                elif profile["position"] == "Goalkeeper":
                    workout_steps = 3800
                    workout_cals = 750
                else:
                    workout_steps = 9500
                    workout_cals = 1300
            elif w["type"] == "Recovery Split":
                workout_steps = 3000
                workout_cals = 200
            else:
                rate = 110 if profile["position"] != "Goalkeeper" else 40
                workout_steps = w["duration_min"] * rate
                workout_cals = w["duration_min"] * (w["rpe"] + 1)
                
        steps = max(1200 if is_detrained else 2000, int(profile["step_base"] + workout_steps + random.randint(-1000, 1000)))
        active_calories = max(50 if is_detrained else 100, int((profile["cal_base"] * 0.35) + workout_cals + random.randint(-100, 120)))
        
        if profile["position"] == "Goalkeeper":
            steps = min(7500, steps)
            active_calories = min(1500, active_calories)

        # Update internal physiology vectors
        daily_load_normalized = daily_training_load / 1000.0
        accumulated_fatigue = (accumulated_fatigue * 0.84) + (daily_load_normalized * 0.16)
        accumulated_fitness = (accumulated_fitness * 0.96) + (daily_load_normalized * 0.04)
        
        if not is_training_or_match:
            accumulated_fatigue *= 0.78
            
        history.append({
            "date": current_date.isoformat(),
            "resting_hr": resting_hr,
            "hrv": hrv,
            "sleep_duration": round(sleep_duration, 1),
            "sleep_quality": sleep_quality,
            "steps": steps,
            "active_calories": active_calories,
            "workouts": workouts
        })
        
    return history

def get_live_tick_data(player_id: str, workout_type: str, elapsed_seconds: int) -> Dict[str, Any]:
    """
    Simulates real-time raw watch sensors (heart rate, steps, calories).
    """
    profile = SQUAD_ROSTER.get(player_id)
    if not profile:
        raise ValueError(f"Player with ID {player_id} not found.")
        
    random.seed()
    w_type = workout_type.upper()
    
    if w_type == "MATCH PLAY":
        if profile["position"] == "Goalkeeper":
            cycle = elapsed_seconds % 120
            if cycle < 15:
                target_hr_pct = 0.85 + 0.05 * random.random()
                cadence = 150
            else:
                target_hr_pct = 0.52 + 0.08 * random.random()
                cadence = 45
            cal_per_sec = 0.12
        else:
            cycle = elapsed_seconds % 60
            if cycle < 12:
                target_hr_pct = 0.88 + 0.08 * math.sin(elapsed_seconds / 5.0)
                cadence = 185
            else:
                target_hr_pct = 0.76 + 0.04 * math.sin(elapsed_seconds / 20.0)
                cadence = 120
            cal_per_sec = 0.28
            
    elif w_type == "TACTICAL SESSION":
        cycle = elapsed_seconds % 180
        if cycle < 80:
            target_hr_pct = 0.65 + 0.08 * random.random()
            cadence = 110
        else:
            target_hr_pct = 0.50 + 0.05 * random.random()
            cadence = 50
        cal_per_sec = 0.15
        
    elif w_type == "CONDITIONING SPLIT":
        cycle = elapsed_seconds % 45
        if cycle < 20:
            target_hr_pct = 0.90 + 0.05 * random.random()
            cadence = 190
        else:
            target_hr_pct = 0.60 + 0.10 * random.random()
            cadence = 40
        cal_per_sec = 0.32
        
    else:
        cycle = elapsed_seconds % 90
        if cycle < 40:
            target_hr_pct = 0.72 + 0.05 * random.random()
            cadence = 20
        else:
            target_hr_pct = 0.52 + 0.04 * random.random()
            cadence = 0
        cal_per_sec = 0.10
        
    instant_hr = int(profile["rest_hr_base"] + target_hr_pct * (profile["max_hr"] - profile["rest_hr_base"]))
    instant_hr = max(40, min(profile["max_hr"], instant_hr + random.randint(-2, 2)))
    
    accumulated_steps = int((cadence / 60.0) * elapsed_seconds)
    accumulated_calories = int(cal_per_sec * elapsed_seconds)
    
    return {
        "athlete_id": player_id,
        "elapsed_seconds": elapsed_seconds,
        "heart_rate": instant_hr,
        "steps": accumulated_steps,
        "active_calories": accumulated_calories,
        "timestamp": datetime.datetime.now().isoformat()
    }
