import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '';
const baseURL = rawBaseURL.replace(/\/+$/, ''); // strip trailing slash

const http = axios.create({
  baseURL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Avoid double /api when baseURL already includes it
  const baseEndsWithApi = baseURL.endsWith('/api');
  if (baseEndsWithApi && typeof config.url === 'string' && config.url.startsWith('/api')) {
    config.url = config.url.replace(/^\/api/, '');
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;
