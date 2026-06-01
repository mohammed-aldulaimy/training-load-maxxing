/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';

export default function PerformanceChart({ history }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(700);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      setWidth(containerRef.current.clientWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!history || history.length === 0) return null;

  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const acuteValues = history.map(d => d.acute_workload);
  const chronicValues = history.map(d => d.chronic_workload);

  const maxLoad = Math.max(...acuteValues, ...chronicValues, 800);
  const yMax = Math.ceil(maxLoad / 200) * 200;
  const xDenominator = Math.max(1, history.length - 1);

  const getX = (index) => paddingLeft + (index / xDenominator) * chartWidth;
  const getY = (value) => height - paddingBottom - (value / yMax) * chartHeight;

  const acutePoints = acuteValues.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');
  const chronicPoints = chronicValues.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');

  const acuteAreaPoints = `${getX(0)},${height - paddingBottom} ${acutePoints} ${getX(history.length - 1)},${height - paddingBottom}`;
  const chronicAreaPoints = `${getX(0)},${height - paddingBottom} ${chronicPoints} ${getX(history.length - 1)},${height - paddingBottom}`;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - paddingLeft;
    
    if (x < 0 || x > chartWidth) {
      setHoveredIndex(null);
      return;
    }

    const pct = x / chartWidth;
    const index = Math.min(
      history.length - 1,
      Math.max(0, Math.round(pct * (history.length - 1)))
    );

    setHoveredIndex(index);
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 100
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    gridLines.push(yMax * (i / 4));
  }

  const hoveredDay = hoveredIndex !== null ? history[hoveredIndex] : null;

  return (
    <article className="panel chart-card" ref={containerRef}>
      <div className="chart-card__header">
        <div>
          <h2>Workload trends</h2>
          <p className="chart-card__subtitle">
            Rolling 7d Fatigue (Acute) vs 28d Fitness (Chronic)
          </p>
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-line" style={{ '--legend-color': 'var(--text)' }} />
            <span>Acute Fatigue (7d)</span>
          </div>
          <div className="legend-item">
            <span className="legend-line" style={{ '--legend-color': 'var(--text-muted)' }} />
            <span>Chronic Fitness (28d)</span>
          </div>
        </div>
      </div>

      <div
        className="chart-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg width="100%" height={height}>
          <defs>
            <linearGradient id="acuteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--text)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--text)" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="chronicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--text-muted)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--text-muted)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {gridLines.map((lineVal, idx) => {
            const y = getY(lineVal);
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="rgba(255,255,255,0.08)" 
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  fill="var(--text-muted)" 
                  fontSize="10" 
                  textAnchor="end"
                >
                  {Math.round(lineVal)}
                </text>
              </g>
            );
          })}

          {history.map((day, idx) => {
            if (idx % 7 !== 0 && idx !== history.length - 1) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - paddingBottom + 18}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
              >
                {formatDate(day.date)}
              </text>
            );
          })}

          <polygon points={chronicAreaPoints} fill="url(#chronicGrad)" />
          <polygon points={acuteAreaPoints} fill="url(#acuteGrad)" />

          <polyline 
            fill="none" 
            stroke="var(--text-muted)" 
            strokeWidth="2" 
            points={chronicPoints}
            strokeLinecap="round"
          />
          <polyline 
            fill="none" 
            stroke="var(--text)" 
            strokeWidth="2" 
            points={acutePoints}
            strokeLinecap="round"
          />

          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={paddingTop}
                x2={getX(hoveredIndex)}
                y2={height - paddingBottom}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
                strokeDasharray="3"
              />

              <circle
                cx={getX(hoveredIndex)}
                cy={getY(acuteValues[hoveredIndex])}
                r="5"
                fill="var(--bg)"
                stroke="var(--text)"
                strokeWidth="2"
              />

              <circle
                cx={getX(hoveredIndex)}
                cy={getY(chronicValues[hoveredIndex])}
                r="5"
                fill="var(--bg)"
                stroke="var(--text-muted)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {hoveredIndex !== null && hoveredDay && (
          <div
            className="chart-tooltip"
            style={{
              '--tooltip-x': `${Math.min(tooltipPos.x, width - 210)}px`,
              '--tooltip-y': `${Math.max(10, tooltipPos.y)}px`,
            }}
          >
            <div className="tooltip__date">{formatDate(hoveredDay.date)}</div>

            <div className="tooltip__rows">
              <div className="tooltip__row">
                <span className="tooltip__label">Acute (7d)</span>
                <span className="tooltip__value">{hoveredDay.acute_workload}</span>
              </div>
              <div className="tooltip__row">
                <span className="tooltip__label">Chronic (28d)</span>
                <span className="tooltip__value" style={{ '--tooltip-color': 'var(--text-muted)' }}>
                  {hoveredDay.chronic_workload}
                </span>
              </div>

              <div className="tooltip__row">
                <span className="tooltip__label">ACWR Stress</span>
                <span className="tooltip__value">{hoveredDay.acwr}</span>
              </div>

              <div className="tooltip__row">
                <span className="tooltip__label">Readiness</span>
                <span className="tooltip__value">{hoveredDay.readiness_score}%</span>
              </div>

              <div className="tooltip__row tooltip__row--muted">
                <span>Workouts:</span>
                <span>{hoveredDay.workouts?.length || 0} ({hoveredDay.daily_load} load)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
