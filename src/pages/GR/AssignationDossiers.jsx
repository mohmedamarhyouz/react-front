import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchDossiers, transfertDossier } from '../../api/dossiersApi';
import { fetchBrigades } from '../../api/brigadesApi';
import Card from '../../components/Common/Card';

const AssignationDossiers = () => {
  const [selection, setSelection] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: brigades } = useQuery({
    queryKey: ['brigades'],
    queryFn: async () => {
      const { data } = await fetchBrigades();
      return data;
    },
  });

  const {
    data: dossiersData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['dossiers', 'assignation'],
    queryFn: async () => {
      const { data } = await fetchDossiers({
        statutLocalisation: 'EnCours',
        pageSize: 50,
      });
      return data;
    },
  });

  const dossiers =
    dossiersData?.items || dossiersData?.dossiers || dossiersData || [];

  const mutation = useMutation({
    mutationFn: ({ id, brigadeId }) =>
      transfertDossier(id, {
        brigadeId,
        commentaire: 'Assignation initiale par le Service GR',
      }),
    onSuccess: () => {
      setMessage('Dossier assigné.');
      setError('');
      refetch();
    },
    onError: (err) => {
      setMessage('');
      setError(
        err?.response?.data?.message ||
          'Erreur lors de l’assignation du dossier.'
      );
    },
  });

  const assigner = (id) => {
    const brigadeId = selection[id];
    if (!brigadeId) return;
    mutation.mutate({ id, brigadeId });
  };

  return (
    <div className="page">
      <h2>Dossiers à répartir (Service GR)</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      <Card>
        {isLoading ? (
          <div className="muted">Chargement...</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>CIN</th>
                  <th>Nom & prénom</th>
                  <th>Adresse</th>
                  <th>Brigade actuelle</th>
                  <th>Assigner à</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dossiers.map((d) => (
                  <tr key={d.id}>
                    <td>{d.reserviste?.cin}</td>
                    <td>
                      {d.reserviste?.nom} {d.reserviste?.prenom}
                    </td>
                    <td>{d.adresseInvestiguer}</td>
                    <td>{d.brigade?.nom || '-'}</td>
                    <td>
                      <select
                        value={selection[d.id] || ''}
                        onChange={(e) =>
                          setSelection((prev) => ({
                            ...prev,
                            [d.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Sélectionner une brigade</option>
                        {brigades?.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nom} — {b.zone}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => assigner(d.id)}
                        disabled={mutation.isPending}
                      >
                        Assigner
                      </button>
                    </td>
                  </tr>
                ))}
                {!dossiers.length && (
                  <tr>
                    <td colSpan="6" className="muted">
                      Aucun dossier à répartir.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AssignationDossiers;
