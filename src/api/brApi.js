import http from './http';

export const uploadBRFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post('/api/br/upload-fichier', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const fetchResultatsConsolides = () =>
  http.get('/api/gr/resultats');
