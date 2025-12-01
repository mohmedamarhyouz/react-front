import http from './http';

export const fetchPvFile = (id) =>
  http.get(`/api/pv/${id}/fichier`, { responseType: 'blob' });
