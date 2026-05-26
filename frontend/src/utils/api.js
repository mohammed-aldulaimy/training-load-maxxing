const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Fetches all athletes summaries (current ACWR, readiness, resting HR, etc.)
 */
export async function fetchAthletes() {
  const response = await fetch(`${API_BASE_URL}/athletes`);
  if (!response.ok) {
    throw new Error('Failed to fetch athletes');
  }
  return response.json();
}

/**
 * Fetches the 45-day history logs for a specific athlete
 */
export async function fetchAthleteHistory(athleteId) {
  const response = await fetch(`${API_BASE_URL}/athletes/${athleteId}/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history for athlete ${athleteId}`);
  }
  return response.json();
}

/**
 * Fetches LLM-powered or local-heuristic coaching insights for a specific athlete.
 * Optionally passes a Gemini API Key via request headers.
 */
export async function fetchAthleteInsights(athleteId, geminiApiKey = '') {
  const headers = {};
  if (geminiApiKey && geminiApiKey.trim()) {
    headers['X-Gemini-Key'] = geminiApiKey.trim();
  }

  const response = await fetch(`${API_BASE_URL}/athletes/${athleteId}/insights`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch AI insights for athlete ${athleteId}`);
  }
  return response.json();
}

/**
 * Logs a simulated workout from the smartwatch interface, updating training load.
 */
export async function addWorkout(athleteId, workoutData) {
  const response = await fetch(`${API_BASE_URL}/athletes/${athleteId}/workout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workoutData),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload workout for athlete ${athleteId}`);
  }
  return response.json();
}

/**
 * Retrieves simulated real-time watch telemetry from the Python server.
 */
export async function fetchLiveTick(athleteId, workoutType, elapsedSeconds) {
  const response = await fetch(`${API_BASE_URL}/athletes/${athleteId}/live-tick`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workout_type: workoutType,
      elapsed_seconds: elapsedSeconds,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve smartwatch live tick');
  }
  return response.json();
}

/**
 * Resets the in-memory database on the Python backend to initial baselines.
 */
export async function resetDatabase() {
  const response = await fetch(`${API_BASE_URL}/athletes/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to reset backend database');
  }
  return response.json();
}
