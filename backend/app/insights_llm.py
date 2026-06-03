import os
from typing import Dict, Any, List

# Fallback Local Heuristic AI Coach Engine - Outputs Strict, Premium Markdown
def generate_local_insights(athlete_summary: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates a beautifully formatted, strict sports-science Markdown performance report
    matching elite club head of sports science standards.
    """
    name = athlete_summary["name"]
    position = athlete_summary["sport"] # player position
    cur = athlete_summary["current_status"]
    avg = athlete_summary["averages"]
    
    acwr = cur["acwr"]
    acwr_zone = cur["acwr_zone"]
    hrv = cur["hrv"]
    resting_hr = cur["resting_hr"]
    sleep_quality = cur["sleep_quality"]
    sleep_duration = cur["sleep_duration"]
    
    # 1. EVALUATE ACWR AND PHYSIOLOGY STATUS BANNERS
    if acwr_zone == "Sweet Spot":
        status_banner = f"🟢 **FIT & AVAILABLE**: Player is training in the optimal **Sweet Spot (ACWR {acwr})**. Cardiovascular adaptation is supercompensating and soft-tissue injury risk is at squad minimums."
    elif acwr_zone == "Danger Zone":
        status_banner = f"🔴 **EXTREME INJURY RISK**: Player has spiked workloads into the **Danger Zone (ACWR {acwr})**. Mechanical fatigue has exceeded physical conditioning threshold. Immediate training cap recommended."
    elif acwr_zone == "Buffer Zone":
        status_banner = f"🟡 **MONITOR CLOSELY**: Player has entered the **Buffer Zone (ACWR {acwr})**. Fatigue is elevated. Taper training speed and volume over the next 48 hours to prevent hamstring/groin strain."
    else: # Under-training
        status_banner = f"🔵 **UNDER-LOADED**: Player is in an **Under-training phase (ACWR {acwr})**. Capillary density and anaerobic threshold are actively deconditioning. Low fatigue, but highly vulnerable to spikes."

    # 2. EVALUATE STRENGTHS (What they are doing good with)
    strengths = []
    
    # ACWR
    if acwr_zone == "Sweet Spot":
        strengths.append(f"**Optimal Workload Progression**: Maintained highly consistent daily loading increments (ACWR {acwr}), driving safe chronic fitness accumulation without soft-tissue strain.")
    elif acwr_zone == "Under-training":
        strengths.append(f"**Structural Rest**: Musculoskeletal system is fully decompressed with zero residual mechanical joint strain, leaving glycogen stores fully loaded.")

    # HRV / RHR
    recent_hrv_days = [d["hrv"] for d in history[-5:]]
    avg_recent_hrv = sum(recent_hrv_days) / len(recent_hrv_days)
    if avg_recent_hrv >= avg["avg_hrv"] * 0.95:
        strengths.append(f"**Autonomic Resilience**: Five-day rolling HRV average ({int(avg_recent_hrv)} ms) matches squad baseline, indicating a highly balanced sympathetic/parasympathetic nervous system.")
    if resting_hr <= profile_rest_hr_base(position) + 2:
        strengths.append(f"**Cardiovascular Conditioning**: Resting heart rate ({resting_hr} BPM) indicates strong cardiac stroke volume and excellent aerobic fitness adaptation.")

    # Sleep
    if sleep_quality >= 80:
        strengths.append(f"**Sleep Discipline**: High sleep quality ({sleep_quality}%, {sleep_duration}h average), promoting deep Delta-wave sleep cycles, maximizing muscle tissue repair and CNS recovery.")

    # Position-Specific
    if "Midfielder" in position:
        strengths.append("**Aerobic Base Capacity**: Demonstrates excellent cardiovascular efficiency, allowing sustained high work rates (12km+ distance capacity) with low residual fatigue.")
    elif "Winger" in position:
        strengths.append("**Neuromuscular Elasticity**: Excellent recovery rate of fast-twitch muscle fibers, enabling repeated explosive sprinting capacity without lateral knee stress.")
    elif "Goalkeeper" in position:
        strengths.append("**CNS Speed Priming**: High reaction velocity and explosive vertical force clearance, indicating high baseline central nervous system charge.")

    # Ensure count
    if len(strengths) < 2:
        strengths.append("**Track Compliance**: Excellent compliance with daily biometric smartwatch recording and team tactical reviews.")

    # 3. EVALUATE AREAS FOR IMPROVEMENT (What they could improve on)
    weaknesses = []
    
    # ACWR
    if acwr_zone == "Danger Zone":
        weaknesses.append(f"**Acute Overreaching Spike**: Spiked training stress rapidly to ACWR {acwr}. Muscle glycogen is depleted and joint tissue is carrying high micro-tears.")
    elif acwr_zone == "Under-training":
        weaknesses.append(f"**Aerobic Deconditioning**: Training stimulus is too low (ACWR {acwr}). Player is losing structural capillary density and high-speed sprint tolerance.")

    # HRV / RHR
    if avg_recent_hrv < avg["avg_hrv"] * 0.95:
        hrv_drop = round((1 - (avg_recent_hrv / avg["avg_hrv"])) * 100)
        weaknesses.append(f"**Autonomic Compression**: HRV average has compressed by {abs(hrv_drop)}% ({int(avg_recent_hrv)} ms vs base {int(avg['avg_hrv'])} ms), signaling systemic stress and central fatigue.")
    if resting_hr > profile_rest_hr_base(position) + 3:
        weaknesses.append(f"**Cardiac Strain**: Resting Heart Rate has drifted up to {resting_hr} BPM (+3 above base), signaling overtraining fatigue, dehydration, or emotional stress.")

    # Sleep
    if sleep_quality < 70:
        weaknesses.append(f"**Recovery Sleep Debt**: Insufficient sleep quality ({sleep_quality}%, {sleep_duration}h), which restricts human growth hormone (HGH) release and slows joint ligament reconstruction.")

    # Position-Specific
    if "Winger" in position and acwr > 1.3:
        weaknesses.append("**Hamstring Tear Threat**: High-speed sprint meters have spiked. Risk of hamstring/adductor tears is critically elevated; cap peak sprint speed at 85% in training.")
    elif "Goalkeeper" in position and sleep_quality < 70:
        weaknesses.append("**Visual Reaction Lag**: Poor sleep patterns are degrading spatial reaction times by 10-15ms, directly impacting shot-stopping capabilities.")

    # Ensure count
    if len(weaknesses) < 2:
        weaknesses.append("**Periodization Balancing**: Positional movement drills could be distributed more evenly across light recovery days.")

    # 4. TACTICAL WEEKLY SCHEDULE
    if position == "Goalkeeper":
        schedule_table = """
| Day | Recommended Focus | Sports-Science Rationale |
| :--- | :--- | :--- |
| **Monday** | Active Recovery & Yoga | Low mechanical impact. Cap HR at 110 BPM. 30 mins deep stretching and core mobility. |
| **Tuesday** | Reaction Speed & Footwork | High CNS activation. Focus on shot-stopping drills, hand-eye coordination, and agility. |
| **Wednesday** | Match Simulation Scrimmage | Peak goalkeeper dive loading. Monitor peak heart rate during goalkeeper drills. |
| **Thursday** | Gym Power & Ball Distribution | Target upper body explosiveness. Weighted medicine ball throws and elastic band jumps. |
| **Friday** | Pre-Match Taper Activation | Neuromuscular priming. Light reaction catch drills, cap high dives to prevent joint soreness. |
| **Saturday** | **MATCH DAY - 90 Min Play** | Maximum concentration. Hydrate aggressively, ingest rapid electrolytes pre-match. |
| **Sunday** | Contrast Bath Recovery | Systemic recovery. 15 mins alternating hot-cold pools, post-match flush walk. |
"""
    else: # Outfield Players
        schedule_table = f"""
| Day | Recommended Focus | Sports-Science Rationale |
| :--- | :--- | :--- |
| **Monday** | Light Jog & Massage | Lactate flush. 25 mins easy running below 120 BPM, deep tissue foam rolling. |
| **Tuesday** | Tactical Position Drills | Small-sided games. Focus on spatial structure and technical execution, low cardiac load. |
| **Wednesday** | Conditioning Scrimmage (Peak Load) | Replicate match intensity. Target high-speed running meters and intense conditioning. |
| **Thursday** | Gym Strength / Nordic Hamstrings | Injury prevention. Eccentric hamstring work (Nordics) and core stability. Cap cardio load. |
| **Friday** | Pre-Match Taper Activation | Prime CNS. Light 30m sprint bursts, tactical setups. Total training load capped under 150. |
| **Saturday** | **MATCH DAY - 90 Min Play** | Peak competitive physical effort. Maintain high high-speed running meters. Ingest energy gels. |
| **Sunday** | Post-Match Flush Walk | Flush lower body muscle tissues. 40 mins easy walking, hydration, light stretching. |
"""

    # If player is in the Danger Zone, completely override the schedule table to enforce recovery!
    if acwr_zone == "Danger Zone":
        schedule_table = """
| Day | Recommended Focus | Sports-Science Rationale |
| :--- | :--- | :--- |
| **Monday** | Total Physiological Rest | Halt all physical training. Focus on deep hydration and structural joint relaxation. |
| **Tuesday** | Low-Impact Swimming / Spin | Capped at 25 mins buoyant water movement or zero-resistance indoor spin. Capped at 110 BPM. |
| **Wednesday** | Tactical Board / Match Video | Exempt from high-intensity team scrimmage due to extreme hamstring tear threat. |
| **Thursday** | Deep Tissue Massage & stretching | Active joint recovery. Focus on adductor mobility and deep tissue myofascial release. |
| **Friday** | Pre-Match Activation Walk | Light 15 mins technical stroll. Absolutely zero high-speed running or jumping. |
| **Saturday** | **MATCH DAY - Squad Exemption** | Excluded from squad list. Total rest to allow ACWR rolling fatigue to decline safely. |
| **Sunday** | Active Recovery Walk | Cardiovascular flush. 40 mins comfortable grass walking, light foam rolling. |
"""

    # Build the final strict Markdown document
    markdown_document = f"""# Performance & Sports-Science Report: {name}
* **Squad Role & Position**: {position}
* **Current Status Indicator**: {acwr_zone.upper()} (ACWR: {acwr})

## 📊 Status Summary
{status_banner}

## 🌟 Strengths (What they are doing good with)
{chr(10).join([f"* {s}" for s in strengths])}

## ⚠️ Areas for Improvement (What they could improve on)
{chr(10).join([f"* {w}" for w in weaknesses])}

## 📅 Recommended 7-Day Tactical Calendar
{schedule_table}
"""
    return {"markdown": markdown_document.strip()}


def profile_rest_hr_base(position: str) -> int:
    """Helper baseline RHR lookup"""
    if "Midfielder" in position: return 42
    if "Winger" in position: return 46
    if "Center Back" in position: return 48
    if "Striker" in position: return 45
    return 52


# Live Gemini API Coordinator - Direct Markdown Output
def generate_gemini_insights(athlete_summary: Dict[str, Any], history: List[Dict[str, Any]], api_key: str) -> Dict[str, Any]:
    """
    Constructs a detailed soccer sports-science prompt, queries the live Gemini API,
    and returns a beautifully structured Markdown document.
    """
    try:
        import google.generativeai as genai
    except ImportError:
        print("google-generativeai not installed. Falling back to Local Heuristics Engine.")
        return generate_local_insights(athlete_summary, history)

    # Setup key
    genai.configure(api_key=api_key)
    
    # Query high-speed model
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    # Compress timeseries summary to fit token window efficiently
    history_summary = []
    for day in history:
        history_summary.append({
            "date": day["date"],
            "resting_hr": day["resting_hr"],
            "hrv": day["hrv"],
            "sleep_quality": day["sleep_quality"],
            "sleep_duration": day["sleep_duration"],
            "daily_load": day["daily_load"],
            "acwr": day["acwr"],
            "readiness_score": day["readiness_score"]
        })
        
    athlete_data_payload = {
        "player_profile": {
            "name": athlete_summary["name"],
            "position": athlete_summary["sport"], # position
            "age": athlete_summary["age"],
            "weight_kg": athlete_summary["weight_kg"],
            "bio": athlete_summary["bio"]
        },
        "current_status": athlete_summary["current_status"],
        "historical_averages": athlete_summary["averages"],
        "45_day_summary_history": history_summary
    }
    
    prompt = f"""
    You are the elite Head of Sports Science & Performance for a world-class professional soccer club (competing in UEFA Champions League / Premier League).
    
    Analyze the following smartwatch telemetry and training load dataset for one of your squad players:
    {json_dumps_payload(athlete_data_payload)}
    
    CRITICAL SOCCER BIOMETRIC GUIDELINES:
    1. Acute:Chronic Workload Ratio (ACWR):
       - < 0.8: Under-training. Aerobic deconditioning occurring. High strain threat on next match exposure.
       - 0.8 to 1.3: The Optimal Sweet Spot. Maximizes sprint threshold adaptations while keeping soft-tissue tear risk low.
       - 1.3 to 1.5: The Buffer. Moderate joint/muscle fatigue. Limit sprint metrics.
       - > 1.5: The Danger Zone. High risk of hamstring pulls/groin tears. Enforce immediate active recovery taper or squad match exclusion.
    2. Positional Demands:
       - Wingers cover intense high-speed sprint meters. Extreme hamstring tear risk when fatigued.
       - Midfielders run 12km+ distance. High aerobic exhaustion danger.
       - Goalkeepers have low steps, but high explosive Central Nervous System diving loads. Visual reaction speeds drop when sleep is poor.
    3. HRV and Sleep: HRV below average means autonomic exhaustion. Sleep quality < 70% halts tissue repair.
    
    YOUR TASK:
    Write a beautifully formatted, comprehensive Sports Science Performance Report for this player.
    You must output a PURE, strictly formatted Markdown document exactly structured like this (do not include markdown wrapper syntax like ```markdown around it, just output the raw markdown text directly):

    # Performance & Sports-Science Report: [Player Name]
    * **Squad Role & Position**: [Player Position]
    * **Current Status Indicator**: [SWEET SPOT / DANGER ZONE / BUFFER ZONE / UNDER-TRAINING] (ACWR: [Value])

    ## 📊 Status Summary
    [A bold 1-sentence physiological assessment of their current availability, training zone, and muscle tear/cardiac stress risks. Make it highly quantitative and clear.]

    ## 🌟 Strengths (What they are doing good with)
    * **[Strength Headline]**: [Detailed sports-science explanation referencing their actual resting HR, HRV average, or sleep recovery metrics from their 45-day history logs]
    * **[Strength Headline]**: [Another metric-backed strength]
    * [Add a 3rd strength if metrics support it, else stop]

    ## ⚠️ Areas for Improvement (What they could improve on)
    * **[Deficit Headline]**: [Detailed description of acute fatigue accumulation, sleep deficit, or hamstring/groin strain threat, referencing actual RHR/HRV drifts]
    * **[Deficit Headline]**: [Another metric-backed deficit / warning]
    * [Add a 3rd deficit if metrics support it, else stop]

    ## 📅 Recommended 7-Day Tactical Calendar
    Generate a beautiful Markdown Table detailing a 7-day tactical schedule (Monday to Sunday) customized to their position and current fatigue level. 
    - The table MUST have columns: | Day | Recommended Focus | Sports-Science Rationale |
    - Day names should be bold (e.g. **Monday**).
    - If they are in the DANGER ZONE (ACWR > 1.5), you MUST prescribe a strict non-impact recovery taper schedule (swimming/spin, benching from match).
    - If in the SWEET SPOT, structure a standard tactical squad schedule (tactical drills Tue, scrimmage Wed, tapers Fri, Match Sat, active recovery Mon/Sun).
    """
    
    try:
        response = model.generate_content(prompt)
        markdown_text = response.text.strip()
        
        # Guard against LLM enclosing in ```markdown tags
        if markdown_text.startswith("```markdown"):
            markdown_text = markdown_text[11:]
        if markdown_text.endswith("```"):
            markdown_text = markdown_text[:-3]
            
        markdown_text = markdown_text.strip()
        return {"markdown": markdown_text}
        
    except Exception as e:
        print(f"Gemini API execution error: {str(e)}. Falling back to Local Heuristics Engine.")
        return generate_local_insights(athlete_summary, history)


def json_dumps_payload(payload: Dict[str, Any]) -> str:
    """Helper to convert payload to clean string safely"""
    import json
    return json.dumps(payload, indent=2)
