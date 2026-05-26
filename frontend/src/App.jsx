import React, { useState, useEffect } from 'react';
import { fetchAthletes, fetchAthleteHistory, fetchAthleteInsights, resetDatabase } from './utils/api';
import AthleteCard from './components/AthleteCard';
import MetricCard from './components/MetricCard';
import PerformanceChart from './components/PerformanceChart';
import AICoachPanel from './components/AICoachPanel';
import LiveSimulator from './components/LiveSimulator';
import { Activity, ShieldAlert, Heart, Moon, Dumbbell, Sparkles, RefreshCw, Trophy, ArrowLeft } from 'lucide-react';

export default function App() {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  
  // Selected athlete biometrics & history
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  // Gemini API Key saved in local storage
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  // Load active roster on mount
  useEffect(() => {
    loadRoster();
  }, []);

  const loadRoster = async () => {
    setLoading(true);
    try {
      const data = await fetchAthletes();
      setAthletes(data);
    } catch (e) {
      console.error('Error loading athlete roster:', e);
    } finally {
      setLoading(false);
    }
  };

  // Load detailed history & AI Coach recommendation for selected athlete
  const handleSelectAthlete = async (athleteId) => {
    setSelectedAthleteId(athleteId);
    setLoading(true);
    setInsights(null);
    setHistory([]);
    
    try {
      // 1. Fetch 45 day history logs for charts
      const histData = await fetchAthleteHistory(athleteId);
      setHistory(histData);

      // 2. Fetch AI Insights (either online Gemini or local fallback rules)
      setInsightsLoading(true);
      const insightData = await fetchAthleteInsights(athleteId, geminiApiKey);
      setInsights(insightData);
    } catch (e) {
      console.error('Error loading athlete detailed data:', e);
    } finally {
      setLoading(false);
      setInsightsLoading(false);
    }
  };

  const handleRefreshInsights = async () => {
    if (!selectedAthleteId) return;
    setInsightsLoading(true);
    try {
      const insightData = await fetchAthleteInsights(selectedAthleteId, geminiApiKey);
      setInsights(insightData);
    } catch (e) {
      console.error('Error refreshing insights:', e);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleApiKeyChange = (newKey) => {
    setGeminiApiKey(newKey);
    localStorage.setItem('gemini_api_key', newKey);
  };

  // Callback triggered when the smartwatch simulator successfully posts a workout
  const handleWorkoutLogged = (updatedAthleteSummary) => {
    // 1. Update the athlete's summary in the local list
    setAthletes(prev => prev.map(ath => 
      ath.id === updatedAthleteSummary.id ? updatedAthleteSummary : ath
    ));
    
    // 2. Refetch the 45-day history to redraw charts with the new session
    fetchAthleteHistory(selectedAthleteId).then(histData => {
      setHistory(histData);
    });

    // 3. Re-trigger AI insights calculation based on the new fatigue and load ratios!
    handleRefreshInsights();
  };

  const handleResetDb = async () => {
    if (!window.confirm('Are you sure you want to reset the ML database to baseline synthetic data? All active live workouts will be cleared.')) return;
    setLoading(true);
    try {
      await resetDatabase();
      await loadRoster();
      if (selectedAthleteId) {
        // Reload details for selected athlete
        handleSelectAthlete(selectedAthleteId);
      }
    } catch (e) {
      console.error('Error resetting database:', e);
    } finally {
      setLoading(false);
    }
  };

  // Find active athlete data
  const activeAthlete = athletes.find(a => a.id === selectedAthleteId);

  // Loading page shell
  if (loading && athletes.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <div className="loading-spinner" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '600' }}>Initializing First-Team Squad ML Database...</h3>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Generating 45-day high-fidelity synthetic smartwatch telemetry for soccer squad...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner Navigation Bar */}
      <header className="glass-panel" style={{
        margin: '1.5rem',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--bg-main))'
          }}>
            <Trophy size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, hsl(var(--text-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SQUAD PULSE
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              First-Team Training Load & Performance Analytics
            </span>
          </div>
        </div>

        {/* Global Control Elements */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={handleResetDb} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
            <RefreshCw size={12} /> Reset Database
          </button>
        </div>
      </header>

      {/* Roster Grid (Default View) */}
      {!selectedAthleteId ? (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
          
          {/* Mission & Purpose Intro Banner */}
          <div className="glass-panel" style={{
            padding: '2rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(18, 24, 36, 0.6), rgba(20, 27, 45, 0.4))',
            borderLeft: '4px solid hsl(var(--color-primary))',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: 'hsl(var(--color-primary))' }} className="pulse-primary" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'hsl(var(--color-primary))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Mission: Democratizing Performance Analytics
              </span>
            </div>
            
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: '800', lineHeight: '1.25', background: 'linear-gradient(90deg, #fff, hsl(var(--text-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Elite Sports Science for Every Athlete
            </h2>
            
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '1100px' }}>
              The purpose of this platform is to leverage regular, consumer-grade smartwatch telemetry (Apple Watch, Garmin, Fitbit) to deliver advanced, institutional-level health evaluation metrics. We democratize sports science for <strong>high school, collegiate, and professional athletic programs</strong> at a low cost. Rather than forcing athletic departments and players to invest in expensive proprietary diagnostic devices, wearable vests (e.g., Catapult), and subscription-heavy diagnostics, this tool harnesses raw wearable data to calculate elite-level physiological strains, fatigue zones, and structured LLM coaching recommendations.
            </p>
            
            {/* Quick Value Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              marginTop: '0.5rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'hsl(var(--color-primary))', fontWeight: '800' }}>✓</span>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.8rem', display: 'block', marginBottom: '0.15rem' }}>Consumer Hardware Integration</strong>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Runs natively on raw consumer HealthKit & Garmin sensor feeds.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'hsl(var(--color-primary))', fontWeight: '800' }}>✓</span>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.8rem', display: 'block', marginBottom: '0.15rem' }}>Institutional Diagnostics</strong>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Computes rolling ACWR safety limits and autonomic ANS recovery.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'hsl(var(--color-primary))', fontWeight: '800' }}>✓</span>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.8rem', display: 'block', marginBottom: '0.15rem' }}>Zero Proprietary Cost</strong>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Eliminates expensive professional diagnostics vests and team fees.</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: '800', marginBottom: '0.5rem' }}>
              FC First-Team Roster & Fatigue Tracker
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
              Monitor squad-wide recovery indices, resting biometrics, and acute-to-chronic training stress metrics (ACWR) simulated from real smartwatch feeds. Select a player to analyze positional performance or simulate a workout.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="roster-grid">
              {athletes.map(ath => (
                <AthleteCard 
                  key={ath.id} 
                  athlete={ath} 
                  onClick={() => handleSelectAthlete(ath.id)} 
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Athlete Dashboard View */
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Back Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setSelectedAthleteId(null)}
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              <ArrowLeft size={14} /> Back to Squad Roster
            </button>

            {activeAthlete && (
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
                Currently viewing player: <strong style={{ color: '#fff' }}>{activeAthlete.name}</strong> ({activeAthlete.sport})
              </span>
            )}
          </div>

          {/* Athlete Profile Header Drawer */}
          {activeAthlete && (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '800',
                color: 'hsl(var(--bg-main))',
                fontFamily: 'var(--font-display)'
              }}>
                {activeAthlete.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: '800' }}>{activeAthlete.name}</h2>
                  <span className="badge badge-info">{activeAthlete.sport}</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
                    Age: {activeAthlete.age} | Weight: {activeAthlete.weight_kg} kg
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '0.35rem', lineHeight: '1.4' }}>
                  {activeAthlete.bio}
                </p>
              </div>
            </div>
          )}

          {/* Core Metrics Quick Grid */}
          {activeAthlete && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              <MetricCard 
                title="Autonomic State (HRV)" 
                value={activeAthlete.current_status.hrv} 
                unit="ms" 
                icon={Activity} 
                colorClass={activeAthlete.current_status.hrv >= activeAthlete.averages.avg_hrv * 0.95 ? 'success' : 'danger'}
                subtitle={`Baseline average: ${activeAthlete.averages.avg_hrv} ms`}
                progressValue={(activeAthlete.current_status.hrv / 130) * 100}
              />
              <MetricCard 
                title="Resting Heart Rate" 
                value={activeAthlete.current_status.resting_hr} 
                unit="BPM" 
                icon={Heart} 
                colorClass={activeAthlete.current_status.resting_hr <= 50 ? 'success' : activeAthlete.current_status.resting_hr <= 65 ? 'info' : 'warning'}
                subtitle={`Lower is more cardiovascularly adapted.`}
                progressValue={((90 - activeAthlete.current_status.resting_hr) / 55) * 100}
              />
              <MetricCard 
                title="Recovery Sleep" 
                value={`${activeAthlete.current_status.sleep_duration}h`} 
                unit={`(${activeAthlete.current_status.sleep_quality}%)`}
                icon={Moon} 
                colorClass={activeAthlete.current_status.sleep_quality >= 80 ? 'success' : activeAthlete.current_status.sleep_quality >= 60 ? 'warning' : 'danger'}
                subtitle="Drives central nervous system repair."
                progressValue={activeAthlete.current_status.sleep_quality}
              />
              <MetricCard 
                title="Training Stress (ACWR)" 
                value={activeAthlete.current_status.acwr} 
                unit={activeAthlete.current_status.acwr_zone.toUpperCase()} 
                icon={ShieldAlert} 
                colorClass={activeAthlete.current_status.acwr_zone === 'Sweet Spot' ? 'success' : activeAthlete.current_status.acwr_zone === 'Danger Zone' ? 'danger' : 'warning'}
                subtitle={`Acute Fatigue: ${activeAthlete.current_status.acute_workload} | Fitness: ${activeAthlete.current_status.chronic_workload}`}
                progressValue={(activeAthlete.current_status.acwr / 2.0) * 100}
              />
            </div>
          )}

          {/* Main Visuals & Simulators Layout */}
          <div className="detail-view">
            {/* Left Column: Workload Line Charts & AI Insights Coach */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <PerformanceChart history={history} />
              
              <AICoachPanel 
                insights={insights}
                loading={insightsLoading}
                onRefresh={handleRefreshInsights}
                apiKey={geminiApiKey}
                onApiKeyChange={handleApiKeyChange}
              />
            </div>

            {/* Right Column: Smartwatch Live Stream Simulator */}
            <div>
              <LiveSimulator 
                athleteId={selectedAthleteId} 
                onWorkoutLogged={handleWorkoutLogged} 
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
