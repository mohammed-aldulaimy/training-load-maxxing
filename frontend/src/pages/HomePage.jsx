import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <p className="eyebrow">Consumer telemetry. Elite decisions.</p>
        <h1 id="hero-title" className="hero__title">
          Elite sports science for every athlete.
        </h1>
        <p className="hero__subtitle">
          Squad Pulse turns standard smartwatch data into clear training-load,
          recovery, and readiness guidance.
        </p>
        <Link to="/team" className="btn btn-primary hero__cta">
          View team
        </Link>
      </div>
    </section>
  );
}
