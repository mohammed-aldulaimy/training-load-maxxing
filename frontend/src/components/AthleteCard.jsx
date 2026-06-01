/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { Activity, Heart, Moon } from 'lucide-react';

export default function AthleteCard({ athlete }) {
  const { name, sport, current_status, averages } = athlete;
  const { readiness_score, acwr, acwr_zone, resting_hr, hrv, sleep_duration } = current_status;

  const getZoneStatus = (zone) => {
    switch (zone) {
      case 'Sweet Spot':
        return 'success';
      case 'Buffer Zone':
        return 'warning';
      case 'Danger Zone':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getZoneBadge = (zone) => (
    <span className={`badge badge-${getZoneStatus(zone)}`}>{zone}</span>
  );

  const getReadinessStatus = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness_score / 100) * circumference;

  return (
    <Link to={`/team/${athlete.id}`} className="panel athlete-card">
      <div className="athlete-card__header">
        <div className="athlete-card__title">
          <h2>{name}</h2>
          <span className="athlete-card__sport">{sport}</span>
        </div>

        <div className="readiness-ring" data-status={getReadinessStatus(readiness_score)}>
          <svg width="64" height="64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="transparent"
              stroke="var(--ring-color)"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="readiness-ring__content">
            <span className="readiness-ring__value">{readiness_score}</span>
            <span className="readiness-ring__label">Readiness</span>
          </div>
        </div>
      </div>

      <div className="athlete-card__divider" />

      <div className="athlete-card__metric-row">
        <div>
          <span className="athlete-card__label">Training Stress</span>
          <div className="athlete-card__value">
            <strong>{acwr}</strong>
            {getZoneBadge(acwr_zone)}
          </div>
        </div>

        <div>
          <span className="athlete-card__label">Workouts</span>
          <p className="athlete-card__sessions">{averages.total_workouts} sessions</p>
        </div>
      </div>

      <div className="athlete-card__micro-grid">
        <div className="athlete-card__micro">
          <Heart size={14} />
          <span className="athlete-card__micro-value">{resting_hr}</span>
          <span className="athlete-card__micro-label">RHR</span>
        </div>

        <div className="athlete-card__micro">
          <Activity size={14} />
          <span className="athlete-card__micro-value">{hrv}</span>
          <span className="athlete-card__micro-label">HRV</span>
        </div>

        <div className="athlete-card__micro">
          <Moon size={14} />
          <span className="athlete-card__micro-value">{sleep_duration}h</span>
          <span className="athlete-card__micro-label">Sleep</span>
        </div>
      </div>

      <span className="athlete-card__cta">Open insights</span>
    </Link>
  );
}
