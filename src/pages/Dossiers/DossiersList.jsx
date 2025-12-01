import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDossiers } from '../../api/dossiersApi';
import { fetchBrigades } from '../../api/brigadesApi';
import { fetchCampagnes } from '../../api/campagnesApi';
import Badge from '../../components/Common/Badge';
import { badgeClassByStatut, formatDate } from '../../utils/formatters';

const statutOptions = [
  'EnCours',
  'Localise',
  'NonLocalise',
  'Transfere',
];

const typeOptions = [
  'Reference',
  'NouvelleAdresse',
  'Ecroue',
  'A_Etranger',
  'Decede',
  'Inapte',
  'Inconnue',
];

const DossiersList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    cin: '',
    nom: '',
    brigadeId: '',
    campagneId: '',
    statutLocalisation: '',
    typeLocalisation: '',
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const cinParam = searchParams.get('cin');
    if (cinParam) {
      setFilters((prev) => ({ ...prev, cin: cinParam }));
    }
  }, [searchParams]);

  const { data: brigadesData } = useQuery({
    queryKey: ['brigades'],
    queryFn: async () => {
      const { data } = await fetchBrigades();
      return data;
    },
  });

  const { data: campagnesData } = useQuery({
    queryKey: ['campagnes'],
    queryFn: async () => {
      const { data } = await fetchCampagnes();
      return data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['dossiers', filters],
    queryFn: async () => {
      const { data: dossiersData } = await fetchDossiers(filters);
      return dossiersData;
    },
  });

  const dossiers = useMemo(() => data?.items || data?.dossiers || data || [], [data]);
  const total = data?.total || dossiers.length;

  const onChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleRowClick = (id) => {
    navigate(`/dossiers/${id}`);
  };

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <div className="page">
      <h2>Dossiers de localisation</h2>

      <div className="filters">
        <input
          placeholder="CIN"
          value={filters.cin}
          onChange={(e) => onChangeFilter('cin', e.target.value)}
        />
        <input
          placeholder="Nom / Prénom"
          value={filters.nom}
          onChange={(e) => onChangeFilter('nom', e.target.value)}
        />
        <select
          value={filters.brigadeId}
          onChange={(e) => onChangeFilter('brigadeId', e.target.value)}
        >
          <option value="">Brigade</option>
          {brigadesData?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nom}
            </option>
          ))}
        </select>
        <select
          value={filters.campagneId}
          onChange={(e) => onChangeFilter('campagneId', e.target.value)}
        >
          <option value="">Campagne</option>
          {campagnesData?.items?.map?.((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          )) ||
            campagnesData?.map?.((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
        </select>
        <select
          value={filters.statutLocalisation}
          onChange={(e) => onChangeFilter('statutLocalisation', e.target.value)}
        >
          <option value="">Statut localisation</option>
          {statutOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.typeLocalisation}
          onChange={(e) => onChangeFilter('typeLocalisation', e.target.value)}
        >
          <option value="">Type localisation</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="muted">Chargement...</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>CIN</th>
                <th>Nom & prénom</th>
                <th>Brigade</th>
                <th>Campagne</th>
                <th>Statut</th>
                <th>Type</th>
                <th>Date de réception</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map((dossier) => (
                <tr
                  key={dossier.id}
                  onClick={() => handleRowClick(dossier.id)}
                  className="clickable-row"
                >
                  <td>{dossier.reserviste?.cin}</td>
                  <td>
                    {dossier.reserviste?.nom} {dossier.reserviste?.prenom}
                  </td>
                  <td>{dossier.brigade?.nom}</td>
                  <td>{dossier.campagne?.nom}</td>
                  <td>
                    <Badge variant={badgeClassByStatut(dossier.statutLocalisation)}>
                      {dossier.statutLocalisation}
                    </Badge>
                  </td>
                  <td>{dossier.typeLocalisation}</td>
                  <td>{formatDate(dossier.dateReception)}</td>
                </tr>
              ))}
              {!dossiers.length && (
                <tr>
                  <td colSpan="7" className="muted">
                    Aucun dossier trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button
          className="btn btn-ghost"
          onClick={() =>
            setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
          }
          disabled={filters.page <= 1}
        >
          Précédent
        </button>
        <span>
          Page {filters.page} / {totalPages}
        </span>
        <button
          className="btn btn-ghost"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              page: Math.min(totalPages, prev.page + 1),
            }))
          }
          disabled={filters.page >= totalPages}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default DossiersList;
