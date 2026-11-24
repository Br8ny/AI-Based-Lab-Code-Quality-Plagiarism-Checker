import axios from 'axios'

// Base URLs default to localhost; override them in frontend/.env.local
// (see .env.example) when the backend runs on another host or port.
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
const WS_BASE = import.meta.env.VITE_WS_BASE || BASE.replace(/^http/, 'ws')

export const api = {
  upload: (formData) =>
    axios.post(`${BASE}/api/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  analyze: (sessionId, language, assignmentName) =>
    axios.post(`${BASE}/api/analyze/${sessionId}`, null, {
      params: { language, assignment_name: assignmentName },
    }),

  getResults: (sessionId) =>
    axios.get(`${BASE}/api/results/${sessionId}`),

  reportPdfUrl: (sessionId) => `${BASE}/api/report/${sessionId}/pdf`,
  reportCsvUrl: (sessionId) => `${BASE}/api/report/${sessionId}/csv`,

  openProgressWs: (sessionId) =>
    new WebSocket(`${WS_BASE}/ws/progress/${sessionId}`),
}
