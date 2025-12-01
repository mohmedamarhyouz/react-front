import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchUsers, createUser } from '../../api/usersApi';
import Card from '../../components/Common/Card';
import { ROLES, ROLE_LABELS } from '../../utils/roles';

const GestionUtilisateurs = () => {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    role: ROLES.BRIGADE,
    motDePasse: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await fetchUsers();
      return data;
    },
  });

  const users = usersData?.items || usersData || [];

  const mutation = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: () => {
      setMessage('Utilisateur créé / mis à jour.');
      setError('');
      setForm({ nom: '', email: '', role: ROLES.BRIGADE, motDePasse: '' });
      refetch();
    },
    onError: (err) => {
      setMessage('');
      setError(
        err?.response?.data?.message ||
          "Impossible d'enregistrer l'utilisateur."
      );
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="page">
      <h2>Gestion des utilisateurs</h2>
      <div className="grid two-columns">
        <Card title="Créer / Modifier un utilisateur">
          <form className="form" onSubmit={onSubmit}>
            <label className="form-label">
              Nom complet
              <input
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                required
              />
            </label>
            <label className="form-label">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </label>
            <label className="form-label">
              Rôle
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-label">
              Mot de passe temporaire
              <input
                type="password"
                value={form.motDePasse}
                onChange={(e) =>
                  setForm((f) => ({ ...f, motDePasse: e.target.value }))
                }
                required
              />
            </label>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
            <button className="btn btn-primary" type="submit">
              Enregistrer
            </button>
          </form>
        </Card>

        <Card title="Utilisateurs">
          {isLoading ? (
            <div className="muted">Chargement...</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Dernière connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id || u.email}>
                      <td>{u.nom || u.name}</td>
                      <td>{u.email}</td>
                      <td>{ROLE_LABELS[u.role] || u.role}</td>
                      <td>{u.derniereConnexion || u.lastLogin || '-'}</td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td colSpan="4" className="muted">
                        Aucun utilisateur.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GestionUtilisateurs;
