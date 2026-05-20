import api from './api';

export async function analyzeCodeRequest({ code, language }) {
  try {
    const response = await api.post('/ai/analyze', { code, language });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'AI analysis failed.';
    throw new Error(message);
  }
}
