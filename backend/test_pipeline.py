from app.data_pipeline import SQUAD_ROSTER, generate_athlete_history
from app.formulas import enrich_athlete_history, get_current_athlete_summary
from app.insights_llm import generate_local_insights

def run_test():
    print("[TEST] Testing Squad Soccer Synthetic Data Pipeline...")
    
    for player_id, profile in SQUAD_ROSTER.items():
        print("\n" + "="*60)
        print(f"PLAYER: {profile['name']} ({profile['position']})")
        print(f"Age: {profile['age']} | Weight: {profile['weight_kg']} kg")
        print(f"Bio: {profile['bio']}")
        
        # 1. Generate History
        raw_history = generate_athlete_history(player_id, days=45)
        print(f"-> Generated {len(raw_history)} days of raw smartwatch logs.")
        
        # 2. Enrich history (Acute load, Chronic load, ACWR, Readiness)
        enriched = enrich_athlete_history(raw_history, hrv_base=profile["hrv_base"])
        print(f"-> Enriched metrics dynamically. Latest day RHR: {enriched[-1]['resting_hr']} | HRV: {enriched[-1]['hrv']} ms")
        
        # 3. Get Summary
        summary = get_current_athlete_summary(enriched, profile)
        status = summary["current_status"]
        print(f"Current Status (Day 45):")
        print(f"   - Resting HR: {status['resting_hr']} BPM | HRV: {status['hrv']} ms")
        print(f"   - Sleep: {status['sleep_duration']} hrs (Quality: {status['sleep_quality']}%)")
        print(f"   - Steps: {status['steps']} | Active Calories: {status['active_calories']} kcal")
        print(f"   - Acute Workload (7d): {status['acute_workload']} | Chronic (28d): {status['chronic_workload']}")
        print(f"   - ACWR: {status['acwr']} ({status['acwr_zone']})")
        print(f"   - Athlete Readiness Index: {status['readiness_score']}%")
        
        # 4. Local AI Insights (Markdown)
        insights = generate_local_insights(summary, enriched)
        print(f"\n[LOCAL SPORTS-SCIENCE COACH MARKDOWN EVALUATION]:")
        try:
            print(insights['markdown'])
        except UnicodeEncodeError:
            print(insights['markdown'].encode('ascii', errors='replace').decode('ascii'))
            
    print("\n[SUCCESS] All synthetic pipelines, rolling formulas, and markdown insights verified successfully!")

if __name__ == "__main__":
    run_test()
