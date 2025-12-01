import http from './http';

export const fetchCampagnes = (params) =>
  http.get('/api/campagnes', { params });

export const fetchCampagne = (id) =>
  http.get(`/api/campagnes/${id}`);

export const createCampagne = (payload) =>
  http.post('/api/campagnes', payload);
