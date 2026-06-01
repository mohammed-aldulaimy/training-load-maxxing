/* eslint-disable react/prop-types */
export default function MetricCard({ title, value, unit, icon: Icon, colorClass, subtitle, progressValue }) {
  const progress = `${Math.min(100, Math.max(0, progressValue ?? 0))}%`;

  return (
    <article className="panel metric-card" data-status={colorClass || 'neutral'}>
      <div className="metric-card__header">
        <span className="metric-card__title">{title}</span>
        <div className="metric-card__icon" aria-hidden="true">
          {Icon && <Icon size={18} />}
        </div>
      </div>

      <div>
        <div className="metric-card__value-row">
          <span className="metric-card__value">{value}</span>
          {unit && <span className="metric-card__unit">{unit}</span>}
        </div>
        {subtitle && <p className="metric-card__subtitle">{subtitle}</p>}
      </div>

      {progressValue !== undefined && (
        <div>
          <div className="metric-card__progress">
            <div className="metric-card__progress-fill" style={{ '--progress': progress }} />
          </div>
          <div className="metric-card__scale">
            <span>0</span>
            <span>Target / Peak</span>
          </div>
        </div>
      )}
    </article>
  );
}
