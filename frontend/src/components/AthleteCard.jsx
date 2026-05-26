import React from 'react';
import { Activity, Moon, ShieldAlert, Heart, TrendingUp } from 'lucide-react';

export default function AthleteCard({ athlete, onClick }) {
  const { name, sport, current_status, averages } = athlete;
  const { readiness_score, acwr, acwr_zone, resting_hr, hrv, sleep_duration } = current_status;

  const getZoneBadge = (zone) => {
    switch (zone) {
      case 'Sweet Spot':
        return <span className="badge badge-success">Sweet Spot</span>;
      case 'Buffer Zone':
        return <span className="badge badge-warning">Buffer Zone</span>;
      case 'Danger Zone':
        return <span className="badge badge-danger">Danger Zone</span>;
      default:
        return <span className="badge badge-info">Under-training</span>;
    }
  };

  // Readiness radial ring styling
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness_score / 100) * circumference;

  const getReadinessColor = (score) => {
    if (score >= 80) return 'hsl(var(--color-success))';
    if (score >= 50) return 'hsl(var(--color-warning))';
    return 'hsl(var(--color-danger))';
  };

  return (
    <div className="glass-panel" onClick={onClick} style={{
      padding: '1.5rem',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow corresponding to safety zone */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        filter: 'blur(30px)',
        opacity: '0.12',
        background: acwr_zone === 'Sweet Spot' ? 'hsl(var(--color-success))' :
                    acwr_zone === 'Danger Zone' ? 'hsl(var(--color-danger))' :
                    acwr_zone === 'Buffer Zone' ? 'hsl(var(--color-warning))' : 'hsl(var(--color-info))'
      }} />

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginBottom: '0.15rem' }}>{name}</h3>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>{sport}</span>
        </div>

        {/* Readiness Radial Indicator */}
        <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="5"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="transparent"
              stroke={getReadinessColor(readiness_score)}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: getReadinessColor(readiness_score) }}>
              {readiness_score}
            </span>
            <span style={{ fontSize: '0.45rem', fontWeight: '700', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', marginTop: '-2px' }}>
              Readiness
            </span>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Core Load Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase' }}>
            Training Stress (ACWR)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>{acwr}</span>
            {getZoneBadge(acwr_zone)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase' }}>
            Daily Workouts
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'hsl(var(--color-primary))' }}>
            {averages.total_workouts} sessions
          </span>
        </div>
      </div>

      {/* Quick Physiological Metric Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        background: 'rgba(0,0,0,0.15)',
        padding: '0.75rem',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
          <Heart size={14} style={{ color: 'hsl(var(--color-danger))', opacity: 0.8 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>{resting_hr}</span>
          <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>RHR (BPM)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <Activity size={14} style={{ color: 'hsl(var(--color-primary))', opacity: 0.8 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>{hrv}</span>
          <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>HRV (ms)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
          <Moon size={14} style={{ color: 'hsl(var(--color-secondary))', opacity: 0.8 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>{sleep_duration}h</span>
          <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Sleep</span>
        </div>
      </div>
      
      {/* Dynamic CTA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: 'hsl(var(--color-primary))',
        opacity: '0',
        transform: 'translateY(4px)',
        transition: 'var(--transition-smooth)',
        marginTop: '-0.5rem',
        marginBottom: '-0.25rem'
      }} className="card-cta">
        Analyze Performance Metrics & AI Coach &rarr;
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel:hover .card-cta {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .glass-panel:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45);
        }
      `}} />
    </div>
  );
}
