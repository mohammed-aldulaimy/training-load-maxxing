import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, Heart, Moon, ShieldAlert } from 'lucide-react';
import AICoachPanel from '../components/AICoachPanel';
import MetricCard from '../components/MetricCard';
import PerformanceChart from '../components/PerformanceChart';
import { fetchAthleteHistory, fetchAthleteInsights, fetchAthletes } from '../utils/api';

export default function AthleteDetailPage() {
  const { id } = useParams();
  const [athlete, setAthlete] = useState(null);
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const loadInsights = useCallback(async () => {
    if (!id) return;

    setInsightsLoading(true);
    try {
      const insightData = await fetchAthleteInsights(id, geminiApiKey);
      setInsights(insightData);
    } catch (err) {
      console.error('Error loading insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  }, [geminiApiKey, id]);

  useEffect(() => {
    let isMounted = true;

    async function loadAthleteDetail() {
      setLoading(true);
      setError('');
      setInsights(null);
      setHistory([]);

      try {
        const [athleteList, historyData, insightData] = await Promise.all([
          fetchAthletes(),
          fetchAthleteHistory(id),
          fetchAthleteInsights(id, geminiApiKey),
        ]);
        const selectedAthlete = athleteList.find((item) => String(item.id) === String(id));

        if (!isMounted) return;

        if (!selectedAthlete) {
          setError('Athlete not found.');
          return;
        }

        setAthlete(selectedAthlete);
        setHistory(historyData);
        setInsights(insightData);
      } catch (err) {
        console.error('Error loading athlete detail:', err);
        if (isMounted) setError('Unable to load this athlete right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAthleteDetail();

    return () => {
      isMounted = false;
    };
  }, [geminiApiKey, id]);

  const handleApiKeyChange = (newKey) => {
    setGeminiApiKey(newKey);
    localStorage.setItem('gemini_api_key', newKey);
  };

  if (loading) {
    return (
      <section className="page loading-state">
        <div className="loading-spinner" />
        <p>Loading athlete detail...</p>
      </section>
    );
  }

  if (error || !athlete) {
    return (
      <section className="page page--narrow">
        <Link to="/team" className="back-link">
          <ArrowLeft size={16} /> Back to team
        </Link>
        <p className="empty-state">{error || 'Athlete not found.'}</p>
      </section>
    );
  }

  const { current_status: currentStatus, averages } = athlete;

  return (
    <section className="page page--detail">
      <Link to="/team" className="back-link">
        <ArrowLeft size={16} /> Back to team
      </Link>

      <div className="detail-layout">
        <div className="detail-main">
          <article className="panel profile-card">
            <div className="avatar" aria-hidden="true">
              {athlete.name[0]}
            </div>
            <div className="profile-card__body">
              <div className="profile-card__title-row">
                <h1>{athlete.name}</h1>
                <span className="badge badge-info">{athlete.sport}</span>
              </div>
              <p className="profile-card__meta">
                Age {athlete.age} / {athlete.weight_kg} kg
              </p>
              <p className="profile-card__bio">{athlete.bio}</p>
            </div>
          </article>

          <div className="metric-grid">
            <MetricCard
              title="Autonomic State"
              value={currentStatus.hrv}
              unit="ms HRV"
              icon={Activity}
              colorClass={currentStatus.hrv >= averages.avg_hrv * 0.95 ? 'success' : 'danger'}
              subtitle={`Baseline average: ${averages.avg_hrv} ms`}
              progressValue={(currentStatus.hrv / 130) * 100}
            />
            <MetricCard
              title="Resting Heart Rate"
              value={currentStatus.resting_hr}
              unit="BPM"
              icon={Heart}
              colorClass={currentStatus.resting_hr <= 50 ? 'success' : currentStatus.resting_hr <= 65 ? 'info' : 'warning'}
              subtitle="Lower is more cardiovascularly adapted."
              progressValue={((90 - currentStatus.resting_hr) / 55) * 100}
            />
            <MetricCard
              title="Recovery Sleep"
              value={`${currentStatus.sleep_duration}h`}
              unit={`${currentStatus.sleep_quality}%`}
              icon={Moon}
              colorClass={currentStatus.sleep_quality >= 80 ? 'success' : currentStatus.sleep_quality >= 60 ? 'warning' : 'danger'}
              subtitle="Supports nervous system recovery."
              progressValue={currentStatus.sleep_quality}
            />
            <MetricCard
              title="Training Stress"
              value={currentStatus.acwr}
              unit={currentStatus.acwr_zone}
              icon={ShieldAlert}
              colorClass={currentStatus.acwr_zone === 'Sweet Spot' ? 'success' : currentStatus.acwr_zone === 'Danger Zone' ? 'danger' : 'warning'}
              subtitle={`Acute ${currentStatus.acute_workload} / Chronic ${currentStatus.chronic_workload}`}
              progressValue={(currentStatus.acwr / 2.0) * 100}
            />
          </div>

          <PerformanceChart history={history} />
        </div>

        <aside className="detail-sidebar" aria-label="Athlete insights">
          <AICoachPanel
            insights={insights}
            loading={insightsLoading}
            onRefresh={loadInsights}
            apiKey={geminiApiKey}
            onApiKeyChange={handleApiKeyChange}
          />
        </aside>
      </div>
    </section>
  );
}
