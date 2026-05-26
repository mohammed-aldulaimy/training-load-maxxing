# Squad Pulse 

## 📋 Project Overview
**Squad Pulse** is an institutional-grade sports science and training-load management platform designed for high school and collegiate athletic programs. The core purpose of this project is to make elite-level performance analytics available to all. A leading cause of soft tissue injuries in athletes is **rapid spikes in acute training volume**. The ability to track these spikes in high school and collegiate programs is limited by funding. Traditional athletic departments are frequently forced to invest in cost-prohibitive proprietary diagnostic devices, wearable vests (**WHOOP**, **Catapult**, etc), and subscription-heavy external diagnostics to track squad safety. For programs that don't have that kind of funding, they are essentially locked out of detailed health metrics.  



Squad Pulse eliminates these barriers by leveraging consumer hardware (Apple Watch, FitBit, etc) over company-specific hardware and utilzing raw health metric data from Apple HealthKit and Google Fit Connect to provide deatailed health metric tracking at an efficient cost. 

---

## The Core Innovation: Leveraged from Regular Smartwatch Metrics
Unlike enterprise athletic platforms that require specialized hardware, **Squad Pulse is built entirely to leverage consumer-grade, regular smartwatch metrics** (such as Apple Watch, Garmin, or Fitbit). By pulling standard telemetry streams out of consumer health frameworks, the platform constructs an advanced diagnostic matrix without demanding a proprietary equipment budget:

* **Heart Rate Variability (HRV):** Extracted directly from resting morning smartwatch states to gauge central nervous system recovery and autonomic nervous system (ANS) balance.
* **Resting Heart Rate (RHR):** Monitored during sleep cycles to detect cardiovascular adaptation, cumulative fatigue accumulation, or systemic overtraining stress.
* **Sleep Architecture:** Captures standard consumer parameters like sleep duration and sleep quality scores to map out hormonal tissue reconstruction periods and mental recovery bounds.
* **Active Output Logs:** Ingests raw session variables—such as training duration, active calories, and steps—directly from standard workout logging apps.

---

## 🚀 Key Features

### 1. Mathematical Acute:Chronic Workload Ratio (ACWR) Engine
The backend pipeline implements modern sports-science mathematics to monitor tissue fatigue and minimize soft-tissue injury risk:
* **Daily Load Computation:** Combines standard workout duration metrics with Rate of Perceived Exertion (RPE) to calculate an integrated objective load unit per session.
* **Rolling Average Windows:** Aggregates daily loads over a 7-day window to measure acute fatigue, alongside a 28-day window to monitor chronic fitness adaptation.
* **Safety Zone Boundaries:** Automatically maps ratios into verified athletic safety profiles, sorting players across *Under-training*, *Sweet Spot (Optimal Performance)*, *Buffer Zone*, and *Danger Zone* thresholds.

### 2. Weighted Readiness Index & Overreaching Penalty
Instead of keeping telemetry metrics completely isolated, Squad Pulse fuses sleep quality and normalized HRV scores into a comprehensive **Readiness Score (0-100%)** right on the main screen. Crucially, the mathematical engine subtracts an *ACWR Deviation Penalty* if an athlete overreaches into unsafe training load boundaries, providing an immediate visual warning of physical vulnerability.

### 3. LLM AI Head of Performance Panel
The system features an integrated conversational intelligence coordinator that maps quantitative tracking data straight into actionable natural language coaching plans:
* **Online Gemini Integration:** Leverages the `gemini-1.5-flash` model to analyze historical profiles and generate institutional sports science briefs.
* **Position-Specific Context Guardrails:** The prompting architecture constrains assessments based on physical demands—warning coaches of hamstring tear threats for high-speed sprinting wingers, aerobic exhaustion dangers for midfielders, and explosive central nervous system or reaction lags for goalkeepers.
* **Adaptive 7-Day Calendar Overrides:** Generates periodized recovery or training blocks based on current workload states. If a player triggers a "Danger Zone" indicator, the system forces a strict active recovery/squad exemption protocol to lower rolling fatigue safely.

### 4. Dual-Engine Architecture Resilience
To protect presentations from network failure or API credential drops, the platform includes a local heuristic failover framework (`generate_local_insights`). If live API calls experience a connection issue, a rule-based engine drops right in to compute identical markdown formats, status banners, strengths, weaknesses, and calendar grids smoothly.

---

## 🛠️ Project Structure & Architecture
The system follows a standard decoupled frontend-backend setup designed for low latency and high telemetry fidelity:

* **`backend/app/formulas.py`**: The quantitative core; manages math calculations for rolling averages, ACWR limits, and normalized biometric readiness scores.
* **`backend/app/data_pipeline.py`**: Generates high-fidelity 45-day synthetic history tracks across 8 diverse athlete profiles to model sleep deprivation, detraining effects, and chronic overtraining states. Includes a live tick simulator to process real-time intra-workout heart rates and step cadences.
* **`backend/app/insights_llm.py`**: Manages prompt orchestrations for live Gemini execution alongside rule-based sports science fallbacks.
* **`frontend/src/App.jsx`**: Coordinates global dashboard view filters, roster card expansions, multi-metric monitoring tracks, and active simulation hooks.
* **`frontend/src/components/AICoachPanel.jsx`**: Houses a custom lightweight markdown tokenizer (`SoccerMarkdownRenderer`) that parses generated structural performance grids and converts them into rich responsive UI elements without relying on heavy external dependencies.


## 📚 Sports-Science Foundations & Academic Citations


### 1. Training Session Workload (Session RPE-Load)
* **Mathematical Formula:** `Daily Load = Duration (min) × Session RPE (1-10)`
* **Citation:** Foster, C., et al. (2001). A new approach to monitoring exercise training. *Journal of Strength and Conditioning Research*, 15(1), 109-115. [PMID: 11708405]
* **Significance:** Validates subjective Rate of Perceived Exertion (RPE) multiplied by duration as a reliable, low-cost proxy for internal physiological stress, matching blood-lactate and expensive telemetry profiles.

### 2. The Training-Injury Prevention Paradox (ACWR Safety Zones)
* **Mathematical Formula:** `ACWR = Acute Workload (7d Rolling Average) / Chronic Workload (28d Rolling Average)`
* **Citation:** Gabbett, T. J. (2016). The training-injury prevention paradox: should athletes be training smarter and harder? *British Journal of Sports Medicine (BJSM)*, 50(5), 273-280. [DOI: 10.1136/bjsports-2015-095788]
* **Significance:** Establishes the Acute:Chronic Workload Ratio (ACWR) safety thresholds—defining the optimal conditioning "Sweet Spot" (0.8–1.3) and the non-contact soft-tissue injury "Danger Zone" (>1.5).

### 3. The Fitness-Fatigue Systems Model
* **Core Concept:** Multi-vector system separating short-term stress decay from long-term adaptation storage.
* **Citation:** Morton, R. H., Fitz-Clarke, J. R., & Banister, E. W. (1990). Flight of the athlete: modeling the responses to training. *Journal of Applied Physiology*, 69(3), 1171-1177. [DOI: 10.1152/jappl.1990.69.3.1171]
* **Significance:** Provides the mathematical blueprint for training load software by modeling how a single physical stimulus induces two opposing vectors: a fast-decaying fatigue effect and a slow-decaying fitness effect.

### 4. Heart Rate Variability (HRV) Normalization
* **Core Concept:** Contextualizing RMSSD time-domain fluctuations against rolling individual baselines over population static averages.
* **Citation:** Plews, D. J., et al. (2013). Training adaptation and heart rate variability in elite endurance athletes: opening the door to effective monitoring. *Sports Medicine*, 43(9), 773-781. [DOI: 10.1007/s40279-013-0071-8]
* **Significance:** Proves that daily raw HRV tracking is only reliable when evaluated against an athlete's personalized rolling baseline to accurately measure parasympathetic reactivation and central nervous system (CNS) readiness.

### 5. Sleep-Guided Athletic Recovery
* **Core Concept:** Integrating macro sleep architecture metrics directly into neuromuscular and cognitive readiness profiles.
* **Citation:** Fullagar, H. H., et al. (2015). Sleep and athletic performance: the effects of sleep loss on exercise performance, and physiological and cognitive recovery. *Sports Medicine*, 45(2), 161-186. [DOI: 10.1007/s40279-014-0260-0]
* **Significance:** Quantifies the direct correlation between sleep deficits (<70% quality) and degraded cognitive-motor reaction speeds, restricted human growth hormone (HGH) release, and delayed glycogen resynthesis.
