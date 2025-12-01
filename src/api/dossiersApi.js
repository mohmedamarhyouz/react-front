import http from './http';

export const fetchDossiers = (params) =>
  http.get('/api/dossiers', { params });

export const fetchDossier = (id) =>
  http.get(`/api/dossiers/${id}`);

export const confirmerAdresse = (id) =>
  http.post(`/api/dossiers/${id}/confirmer-adresse`);

export const nouvelleAdresse = (id, payload) =>
  http.post(`/api/dossiers/${id}/nouvelle-adresse`, payload);

export const adresseInconnue = (id, payload = {}) =>
  http.post(`/api/dossiers/${id}/adresse-inconnue`, payload);

export const transfertDossier = (id, payload) =>
  http.post(`/api/dossiers/${id}/transfert`, payload);

export const marquerDecede = (id, payload = {}) =>
  http.post(`/api/dossiers/${id}/marquer-decede`, payload);

export const marquerEcroue = (id, payload = {}) =>
  http.post(`/api/dossiers/${id}/marquer-ecroue`, payload);

export const marquerEtranger = (id, payload = {}) =>
  http.post(`/api/dossiers/${id}/marquer-etranger`, payload);

export const marquerInapte = (id, payload = {}) =>
  http.post(`/api/dossiers/${id}/marquer-inapte`, payload);

export const casParticulier = (id, payload = {}) =>
  http.post(`/api/dossiers/${id}/cas-particulier`, payload);

export const aucuneAction = (id) =>
  http.post(`/api/dossiers/${id}/aucune-action`);
