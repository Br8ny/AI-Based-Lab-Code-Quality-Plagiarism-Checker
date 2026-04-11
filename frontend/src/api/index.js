import axios from 'axios'

const BASE = 'http://localhost:8000'

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
    new WebSocket(`ws://localhost:8000/ws/progress/${sessionId}`),
}
