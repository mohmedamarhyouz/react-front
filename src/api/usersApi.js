import http from './http';

export const fetchUsers = () => http.get('/api/users');

export const createUser = (payload) => http.post('/api/users', payload);
