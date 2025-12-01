import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createCampagne, fetchCampagnes } from '../../api/campagnesApi';
import Card from '../../components/Common/Card';

const CampagnesList = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    dateDebut: '',
    dateFin: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data, refetch } = useQuery({
    queryKey: ['campagnes'],
    queryFn: async () => {
      const { data: campagnes } = await fetchCampagnes();
      return campagnes;
    },
  });

  const campagnes = data?.items || data || [];

  const mutation = useMutation({
    mutationFn: () => createCampagne(form),
    onSuccess: () => {
      setMessage('Campagne créée.');
      setError('');
      setForm({ nom: '', dateDebut: '', dateFin: '' });
      refetch();
    },
    onError: (err) => {
      setMessage('');
      setError(
        err?.response?.data?.message ||
          'Impossible de créer la campagne pour le moment.'
      );
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="page">
      <h2>Campagnes de localisation</h2>
      <div className="grid two-columns">
        <Card title="Créer une campagne">
          <form className="form" onSubmit={onSubmit}>
            <label className="form-label">
              Nom
              <input
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                required
              />
            </label>
            <label className="form-label">
              Date de début
              <input
                type="date"
                value={form.dateDebut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateDebut: e.target.value }))
                }
                required
              />
            </label>
            <label className="form-label">
              Date de fin
              <input
                type="date"
                value={form.dateFin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateFin: e.target.value }))
                }
                required
              />
            </label>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
            <button className="btn btn-primary" type="submit">
              Créer
            </button>
          </form>
        </Card>

        <Card title="Campagnes">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Dates</th>
                  <th>Statut</th>
                  <th>Dossiers</th>
                </tr>
              </thead>
              <tbody>
                {campagnes.map((c) => (
                  <tr
                    key={c.id}
                    className="clickable-row"
                    onClick={() => navigate(`/campagnes/${c.id}`)}
                  >
                    <td>{c.nom}</td>
                    <td>
                      {c.dateDebut} → {c.dateFin}
                    </td>
                    <td>{c.statut}</td>
                    <td>{c.nombreDossiers || c.totalDossiers || '-'}</td>
                  </tr>
                ))}
                {!campagnes.length && (
                  <tr>
                    <td colSpan="4" className="muted">
                      Aucune campagne pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CampagnesList;
