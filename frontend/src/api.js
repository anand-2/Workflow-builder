import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthCheck = () => api.get('/health');

export const getWorkflows = () => api.get('/workflows');

export const getWorkflow = (id) => api.get(`/workflows/${id}`);

export const createWorkflow = (data) => api.post('/workflows', data);

export const deleteWorkflow = (id) => api.delete(`/workflows/${id}`);

export const runWorkflow = (id, inputText) => 
  api.post(`/workflows/${id}/run`, { inputText });

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Run workflow with streaming. Calls onEvent for each SSE event.
 * onEvent receives { type, stepNumber, stepName, chunk, output, error, results, ... }.
 * Returns a promise that resolves when stream ends or rejects on fetch error.
 */
export async function runWorkflowStream(id, inputText, { onEvent, signal } = {}) {
  const res = await fetch(`${API_BASE}/workflows/${id}/run/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputText }),
    signal: signal || null,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.error || 'Stream failed');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          onEvent && onEvent(data);
        } catch (_) {}
      }
    }
  }
  if (buffer.startsWith('data: ')) {
    try {
      const data = JSON.parse(buffer.slice(6));
      onEvent && onEvent(data);
    } catch (_) {}
  }
}

export const getWorkflowRuns = (id) => api.get(`/workflows/${id}/runs`);

export const getAllRuns = () => api.get('/runs');

export default api;
