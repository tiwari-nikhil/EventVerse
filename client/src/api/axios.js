import axios from 'axios';

// Normalize the API URL — always ensure it ends with /api
// This prevents 404s if VITE_API_URL is set without the /api suffix
const getRawUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) return '/api'; // local dev fallback (uses vite proxy)
  const trimmed = url.replace(/\/$/, ''); // strip trailing slash
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getRawUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ev_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ev_token');
      localStorage.removeItem('ev_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
