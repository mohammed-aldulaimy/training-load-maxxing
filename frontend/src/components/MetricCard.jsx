import React from 'react';

export default function MetricCard({ title, value, unit, icon: Icon, colorClass, subtitle, progressValue }) {
  // Translate colors to tailwind-like custom variable mappings
  const getColorStyle = () => {
    if (colorClass === 'success') return 'hsl(var(--color-success))';
    if (colorClass === 'warning') return 'hsl(var(--color-warning))';
    if (colorClass === 'danger') return 'hsl(var(--color-danger))';
    if (colorClass === 'info') return 'hsl(var(--color-info))';
    return 'hsl(var(--color-primary))';
  };

  const getBgStyle = () => {
    if (colorClass === 'success') return 'hsla(var(--color-success), 0.08)';
    if (colorClass === 'warning') return 'hsla(var(--color-warning), 0.08)';
    if (colorClass === 'danger') return 'hsla(var(--color-danger), 0.08)';
    if (colorClass === 'info') return 'hsla(var(--color-info), 0.08)';
    return 'hsla(var(--color-primary), 0.08)';
  };

  return (
    <div className="glass-card flex flex-col justify-between" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'hsl(var(--text-secondary))', fontFamily: 'var(--font-display)' }}>
          {title}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: getBgStyle(),
          color: getColorStyle()
        }}>
          {Icon && <Icon size={18} />}
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'hsl(var(--text-muted))' }}>
              {unit}
            </span>
          )}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.2rem', fontWeight: '500' }}>
            {subtitle}
          </p>
        )}
      </div>

      {progressValue !== undefined && (
        <div style={{ marginTop: 'auto' }}>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '0.25rem'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, progressValue))}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${getColorStyle()}, hsla(var(--color-secondary), 0.8))`,
              borderRadius: '9999px',
              transition: 'var(--transition-smooth)'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
            <span>0</span>
            <span>Target / Peak</span>
          </div>
        </div>
      )}
    </div>
  );
}
