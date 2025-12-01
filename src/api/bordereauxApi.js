import http from './http';

export const fetchBordereauFile = (id) =>
  http.get(`/api/bordereaux/${id}/fichier`, { responseType: 'blob' });
