import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Activity, Heart, Flame, Footprints, Clock, Check } from 'lucide-react';
import { fetchLiveTick, addWorkout } from '../utils/api';

export default function LiveSimulator({ athleteId, onWorkoutLogged }) {
  const [workoutType, setWorkoutType] = useState('Match Play');
  const [isSimulating, setIsSimulating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Real-time sensor metrics
  const [heartRate, setHeartRate] = useState(72);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [hrHistory, setHrHistory] = useState([70, 72, 71, 73, 72]);

  // Log Modal states
  const [showLogModal, setShowLogModal] = useState(false);
  const [sessionRpe, setSessionRpe] = useState(6);
  const [sessionMetrics, setSessionMetrics] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  const timerRef = useRef(null);
  const maxHrRecorded = useRef(0);
  const totalHrAccumulated = useRef(0);
  const tickCount = useRef(0);

  // Timer Tick Trigger
  useEffect(() => {
    if (isSimulating) {
      timerRef.current = setInterval(async () => {
        setElapsedSeconds(prev => {
          const nextVal = prev + 2; // Tick represents 2 elapsed seconds for faster demo pacing
          triggerTick(nextVal);
          return nextVal;
        });
      }, 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, workoutType]);

  const triggerTick = async (seconds) => {
    try {
      // Retrieve simulated live telemetry from the Python FastAPI server
      const tick = await fetchLiveTick(athleteId, workoutType, seconds);
      
      setHeartRate(tick.heart_rate);
      setSteps(tick.steps);
      setCalories(tick.active_calories);
      setHrHistory(prev => {
        const nextHist = [...prev, tick.heart_rate];
        if (nextHist.length > 12) nextHist.shift(); // keep 12 ticks
        return nextHist;
      });

      // Track averages/max for logging
      if (tick.heart_rate > maxHrRecorded.current) {
        maxHrRecorded.current = tick.heart_rate;
      }
      totalHrAccumulated.current += tick.heart_rate;
      tickCount.current += 1;
      
    } catch (e) {
      console.error('Error fetching smartwatch simulation tick:', e);
    }
  };

  const handleStart = () => {
    if (elapsedSeconds === 0) {
      maxHrRecorded.current = 0;
      totalHrAccumulated.current = 0;
      tickCount.current = 0;
      setHrHistory([70, 72, 71, 73, 72]);
    }
    setIsSimulating(true);
  };

  const handlePause = () => {
    setIsSimulating(false);
  };

  const handleStop = () => {
    setIsSimulating(false);
    
    // Save session stats for the logging modal
    const durationMin = Math.max(15, Math.round(elapsedSeconds / 6)); // Scaled: 6 seconds of simulation = 1 minute of workout to make showcases fun!
    const avgHr = tickCount.current > 0 ? Math.round(totalHrAccumulated.current / tickCount.current) : 130;
    const maxHr = maxHrRecorded.current > 0 ? maxHrRecorded.current : 160;

    setSessionMetrics({
      type: workoutType,
      duration_min: durationMin,
      avg_hr: avgHr,
      max_hr: maxHr
    });

    setShowLogModal(true);
  };

  const handleLogWorkoutSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        type: sessionMetrics.type,
        duration_min: sessionMetrics.duration_min,
        avg_hr: sessionMetrics.avg_hr,
        max_hr: sessionMetrics.max_hr,
        rpe: sessionRpe
      };

      const updatedAthlete = await addWorkout(athleteId, payload);
      setLoggedSuccess(true);
      
      setTimeout(() => {
        setShowLogModal(false);
        setLoggedSuccess(false);
        setElapsedSeconds(0);
        setSteps(0);
        setCalories(0);
        setHeartRate(72);
        onWorkoutLogged(updatedAthlete);
      }, 1500);

    } catch (e) {
      alert('Error uploading session metrics to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Pulse animation rate based on heart rate
  const getPulseSpeed = () => {
    if (heartRate > 150) return '0.4s';
    if (heartRate > 110) return '0.7s';
    return '1.2s';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>
          Smartwatch Live Stream
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
          Simulate real-time workouts to trigger database updates
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0.5rem 0' }}>
        
        {/* Sleek Smartwatch interface (Apple Watch inspired) */}
        <div style={{
          width: '200px',
          height: '240px',
          backgroundColor: '#000',
          border: '6px solid #242A38',
          borderRadius: '38px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), inset 0 0 10px rgba(255,255,255,0.05), 0 0 15px hsla(var(--color-primary), 0.25)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          color: '#fff',
          fontFamily: 'var(--font-display)',
          overflow: 'hidden'
        }}>
          {/* Watch Status Ticks */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: '800' }}>
            <span>9:41 AM</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', color: isSimulating ? 'hsl(var(--color-success))' : 'inherit' }}>
              {isSimulating && <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-success))', display: 'inline-block' }} />}
              {workoutType.toUpperCase()}
            </span>
          </div>

          {/* Main Telemetry Screen */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: 'auto 0' }}>
            
            {/* Pulsing heart rate row */}
            <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '0.4rem', justifyContent: 'center' }}>
              <Heart 
                size={22} 
                fill="hsl(var(--color-danger))" 
                stroke="none" 
                style={{ 
                  animation: `pulse ${getPulseSpeed()} infinite ease-in-out`,
                }} 
              />
              <span style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
                {heartRate}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', alignSelf: 'flex-end', marginBottom: '4px' }}>
                BPM
              </span>
            </div>

            {/* Timer Screen */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', color: 'hsl(var(--color-primary))', fontSize: '1.25rem', fontWeight: '800' }}>
              <Clock size={14} />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {/* Steps & Calories grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Flame size={12} style={{ color: 'hsl(var(--color-warning))' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{calories}</span>
                <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>KCAL</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Footprints size={12} style={{ color: 'hsl(var(--color-primary))' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{steps}</span>
                <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>STEPS</span>
              </div>
            </div>

          </div>

          {/* Micro SVG Heart Rate scrolling visual inside watch */}
          <div style={{ height: '24px', width: '100%', opacity: 0.7, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="100%" height="24">
              <polyline
                fill="none"
                stroke="hsl(var(--color-danger))"
                strokeWidth="1.5"
                points={hrHistory.map((val, idx) => {
                  const x = (idx / 11) * 160;
                  // Scale: heart rate bounds [40, 180] maps to height bounds [24, 0]
                  const y = 24 - ((val - 50) / 130) * 24;
                  return `${x},${y}`;
                }).join(' ')}
              />
            </svg>
          </div>

        </div>

      </div>

      {/* Simulator Control Board */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        
        {/* Workout type selector */}
        {!isSimulating && elapsedSeconds === 0 && (
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
            {['Match Play', 'Tactical Session', 'Conditioning Split', 'Gym/Strength'].map(type => (
              <button
                key={type}
                onClick={() => setWorkoutType(type)}
                style={{
                  flex: 1,
                  background: workoutType === type ? 'hsla(var(--color-primary), 0.15)' : 'transparent',
                  border: 'none',
                  color: workoutType === type ? 'hsl(var(--color-primary))' : 'hsl(var(--text-muted))',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Buttons Panel */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isSimulating && elapsedSeconds === 0 ? (
            <button className="btn btn-primary" onClick={handleStart} style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              <Play size={14} /> Start workout
            </button>
          ) : (
            <>
              {isSimulating ? (
                <button className="btn btn-secondary" onClick={handlePause} style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                  <Pause size={14} /> Pause
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleStart} style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                  <Play size={14} /> Resume
                </button>
              )}
              
              <button className="btn btn-danger" onClick={handleStop} style={{ padding: '0.5rem 1rem' }}>
                <Square size={14} fill="#fff" stroke="none" /> End & Log
              </button>
            </>
          )}
        </div>

      </div>

      {/* Structured Workout Logging Modal */}
      {showLogModal && sessionMetrics && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 12, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '380px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative'
          }}>
            
            {loggedSuccess && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'hsl(var(--bg-surface))',
                borderRadius: 'var(--radius-lg)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  backgroundColor: 'hsla(var(--color-success), 0.1)',
                  color: 'hsl(var(--color-success))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={32} />
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>Session Logged!</h4>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Recalculating athletic training loads...</p>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Log workout session</h3>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                Workout complete. Confirm biometrics and supply effort score.
              </p>
            </div>

            {/* Session Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              background: 'rgba(0,0,0,0.2)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase' }}>Type</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--color-primary))' }}>{sessionMetrics.type}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase' }}>Duration</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{sessionMetrics.duration_min} minutes</span>
              </div>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase' }}>Average HR</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{sessionMetrics.avg_hr} BPM</span>
              </div>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase' }}>Max HR</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{sessionMetrics.max_hr} BPM</span>
              </div>
            </div>

            {/* Rate of Perceived Exertion (RPE) Slider */}
            <form onSubmit={handleLogWorkoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'hsl(var(--text-secondary))' }}>
                    Rating of Perceived Exertion (RPE)
                  </label>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'hsl(var(--color-primary))' }}>
                    {sessionRpe} <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>/10</span>
                  </span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sessionRpe}
                  onChange={(e) => setSessionRpe(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'hsl(var(--color-primary))',
                    cursor: 'pointer'
                  }}
                />
                
                {/* RPE Scale Helper Text */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
                  <span>1 (Light)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Max Effort)</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowLogModal(false)}
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  Confirm & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inject custom watch animations in document head */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}} />

    </div>
  );
}
