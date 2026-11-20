const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api';

export async function askGuideAgent({ message, sessionId, history = [] }) {
  const response = await fetch(`${API_BASE.replace(/\/$/, '')}/guide/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId || null,
      history,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Guide API error (${response.status}): ${errText}`);
  }

  return response.json();
}