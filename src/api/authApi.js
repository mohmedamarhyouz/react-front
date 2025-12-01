import http from './http';

export const loginApi = (payload) => http.post('/api/auth/login', payload);
