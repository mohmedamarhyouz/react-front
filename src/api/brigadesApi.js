import http from './http';

export const fetchBrigades = () => http.get('/api/brigades');
