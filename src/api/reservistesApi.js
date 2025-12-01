import http from './http';

export const fetchReservistes = (params) =>
  http.get('/api/reservistes', { params });

export const fetchReserviste = (cin) =>
  http.get(`/api/reservistes/${cin}`);
