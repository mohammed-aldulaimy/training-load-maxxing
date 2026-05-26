import React, { useState, useRef, useEffect } from 'react';

export default function PerformanceChart({ history }) {
  if (!history || history.length === 0) return null;

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(700);
  const containerRef = useRef(null);

  // Handle resizing dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      setWidth(containerRef.current.clientWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Extract metrics
  const dates = history.map(d => d.date);
  const acuteValues = history.map(d => d.acute_workload);
  const chronicValues = history.map(d => d.chronic_workload);
  const acwrValues = history.map(d => d.acwr);

  // Find max value to scale Y axis (loads go up to ~1200 or 1500)
  const maxLoad = Math.max(...acuteValues, ...chronicValues, 800);
  const yMax = Math.ceil(maxLoad / 200) * 200; // round up to nearest 200

  // Coordinate scaling helpers
  const getX = (index) => paddingLeft + (index / (history.length - 1)) * chartWidth;
  const getY = (value) => height - paddingBottom - (value / yMax) * chartHeight;

  // Calculate points for the lines
  const acutePoints = acuteValues.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');
  const chronicPoints = chronicValues.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');

  // SVG Area Paths for shading under the lines
  const acuteAreaPoints = `${getX(0)},${height - paddingBottom} ${acutePoints} ${getX(history.length - 1)},${height - paddingBottom}`;
  const chronicAreaPoints = `${getX(0)},${height - paddingBottom} ${chronicPoints} ${getX(history.length - 1)},${height - paddingBottom}`;

  // Handle Mouse Hovering
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

  // Format date helper
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  // Generate grid values for Y-axis
  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    gridLines.push(yMax * (i / 4));
  }

  // Find hovered day info
  const hoveredDay = hoveredIndex !== null ? history[hoveredIndex] : null;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative' }} ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>Workload Trends & ACWR Zone</h4>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
            Rolling 7d Fatigue (Acute) vs 28d Fitness (Chronic)
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: '700' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '12px', height: '3px', backgroundColor: 'hsl(var(--color-primary))', borderRadius: '2px' }} />
            <span style={{ color: 'hsl(var(--text-secondary))' }}>Acute Fatigue (7d)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '12px', height: '3px', backgroundColor: 'hsl(var(--color-secondary))', borderRadius: '2px' }} />
            <span style={{ color: 'hsl(var(--text-secondary))' }}>Chronic Fitness (28d)</span>
          </div>
        </div>
      </div>

      <div 
        style={{ position: 'relative', cursor: 'crosshair' }} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg width="100%" height={height}>
          <defs>
            {/* Gradients */}
            <linearGradient id="acuteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--color-primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--color-primary))" stopOpacity="0.00" />
            </linearGradient>
            
            <linearGradient id="chronicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--color-secondary))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(var(--color-secondary))" stopOpacity="0.00" />
            </linearGradient>

            <linearGradient id="sweetSpotGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--color-success))" stopOpacity="0.04" />
              <stop offset="100%" stopColor="hsl(var(--color-success))" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis labels */}
          {gridLines.map((lineVal, idx) => {
            const y = getY(lineVal);
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="rgba(255,255,255,0.04)" 
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  fill="hsl(var(--text-muted))" 
                  fontSize="10" 
                  fontWeight="600"
                  textAnchor="end"
                >
                  {Math.round(lineVal)}
                </text>
              </g>
            );
          })}

          {/* X axis labels (Weekly ticks) */}
          {history.map((day, idx) => {
            if (idx % 7 !== 0 && idx !== history.length - 1) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - paddingBottom + 18}
                fill="hsl(var(--text-muted))"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                {formatDate(day.date)}
              </text>
            );
          })}

          {/* Shaded area plots */}
          <polygon points={chronicAreaPoints} fill="url(#chronicGrad)" />
          <polygon points={acuteAreaPoints} fill="url(#acuteGrad)" />

          {/* Lines */}
          <polyline 
            fill="none" 
            stroke="hsl(var(--color-secondary))" 
            strokeWidth="2.5" 
            points={chronicPoints}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(168, 85, 247, 0.25))' }}
          />
          <polyline 
            fill="none" 
            stroke="hsl(var(--color-primary))" 
            strokeWidth="2.5" 
            points={acutePoints}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(6, 182, 212, 0.35))' }}
          />

          {/* Hover Crosshair and Node Dots */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={paddingTop}
                x2={getX(hoveredIndex)}
                y2={height - paddingBottom}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
                strokeDasharray="3"
              />
              
              {/* Acute dot */}
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(acuteValues[hoveredIndex])}
                r="6"
                fill="hsl(var(--bg-main))"
                stroke="hsl(var(--color-primary))"
                strokeWidth="3"
                style={{ filter: 'drop-shadow(0 0 4px hsl(var(--color-primary)))' }}
              />

              {/* Chronic dot */}
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(chronicValues[hoveredIndex])}
                r="6"
                fill="hsl(var(--bg-main))"
                stroke="hsl(var(--color-secondary))"
                strokeWidth="3"
                style={{ filter: 'drop-shadow(0 0 4px hsl(var(--color-secondary)))' }}
              />
            </g>
          )}
        </svg>

        {/* Dynamic Tooltip Panel overlay */}
        {hoveredIndex !== null && hoveredDay && (
          <div className="glass-panel" style={{
            position: 'absolute',
            left: `${Math.min(tooltipPos.x, width - 210)}px`,
            top: `${Math.max(10, tooltipPos.y)}px`,
            width: '190px',
            padding: '0.75rem',
            zIndex: 10,
            pointerEvents: 'none',
            fontSize: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.4rem', color: '#fff' }}>
              {formatDate(hoveredDay.date)}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Acute (7d):</span>
                <span style={{ fontWeight: '700', color: 'hsl(var(--color-primary))' }}>{hoveredDay.acute_workload}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Chronic (28d):</span>
                <span style={{ fontWeight: '700', color: 'hsl(var(--color-secondary))' }}>{hoveredDay.chronic_workload}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.2rem', marginTop: '0.1rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>ACWR Stress:</span>
                <span style={{
                  fontWeight: '800',
                  color: hoveredDay.acwr_zone === 'Sweet Spot' ? 'hsl(var(--color-success))' :
                         hoveredDay.acwr_zone === 'Danger Zone' ? 'hsl(var(--color-danger))' :
                         hoveredDay.acwr_zone === 'Buffer Zone' ? 'hsl(var(--color-warning))' : 'hsl(var(--color-info))'
                }}>
                  {hoveredDay.acwr}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Readiness Score:</span>
                <span style={{ fontWeight: '700', color: '#fff' }}>{hoveredDay.readiness_score}%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                <span>Workouts:</span>
                <span>{hoveredDay.workouts?.length || 0} ({hoveredDay.daily_load} load)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
