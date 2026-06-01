import { useEffect, useState } from 'react';
import AthleteCard from '../components/AthleteCard';
import { fetchAthletes } from '../utils/api';

export default function TeamPage() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAthletes() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchAthletes();
        if (isMounted) setAthletes(data);
      } catch (err) {
        console.error('Error loading athletes:', err);
        if (isMounted) setError('Unable to load the team right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAthletes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="page page--team" aria-labelledby="team-title">
      <div className="page__header">
        <p className="eyebrow">Team</p>
        <h1 id="team-title">Athletes</h1>
        <p>
          Track readiness, workload, and recovery signals from the active team.
        </p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading athletes...</p>
        </div>
      )}

      {error && <p className="empty-state">{error}</p>}

      {!loading && !error && (
        <div className="athlete-grid">
          {athletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      )}
    </section>
  );
}
