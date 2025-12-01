import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchCampagnes } from '../../api/campagnesApi';
import { fetchDossiers } from '../../api/dossiersApi';
import Card from '../../components/Common/Card';
import { badgeClassByStatut } from '../../utils/formatters';
import { ROLES } from '../../utils/roles';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { role } = useAuth();
  const { data: campagnesData } = useQuery({
    queryKey: ['campagnes'],
    queryFn: async () => {
      const { data } = await fetchCampagnes();
      return data;
    },
  });

  const { data: dossiersData } = useQuery({
    queryKey: ['dossiers', 'dashboard'],
    queryFn: async () => {
      const { data } = await fetchDossiers({ pageSize: 50 });
      return data;
    },
  });

  const campagnes = Array.isArray(campagnesData?.items)
    ? campagnesData.items
    : Array.isArray(campagnesData)
      ? campagnesData
      : [];
  const dossiers = Array.isArray(dossiersData?.items)
    ? dossiersData.items
    : Array.isArray(dossiersData?.dossiers)
      ? dossiersData.dossiers
      : Array.isArray(dossiersData)
        ? dossiersData
        : [];

  const stats = useMemo(() => {
    const totalCampagnes = campagnes.length;
    const enCoursCampagnes = campagnes.filter((c) => c.statut === 'EnCours')
      .length;

    const totalDossiers = dossiers.length;
    const localises = dossiers.filter((d) => d.statutLocalisation === 'Localise')
      .length;
    const nonLocalises = dossiers.filter(
      (d) => d.statutLocalisation === 'NonLocalise'
    ).length;
    const transferes = dossiers.filter(
      (d) => d.statutLocalisation === 'Transfere'
    ).length;

    return {
      totalCampagnes,
      enCoursCampagnes,
      totalDossiers,
      localises,
      nonLocalises,
      transferes,
    };
  }, [campagnes, dossiers]);

  const shortcuts = {
    [ROLES.BR]: [
      { to: '/br/upload', label: 'Transmettre fichier' },
      { to: '/campagnes', label: 'Campagnes' },
      { to: '/br/resultats', label: 'Résultats' },
    ],
    [ROLES.GR]: [
      { to: '/campagnes', label: 'Campagnes' },
      { to: '/dossiers', label: 'Dossiers' },
      { to: '/gr/assignation', label: 'Répartir dossiers' },
    ],
    [ROLES.BRIGADE]: [
      { to: '/dossiers', label: 'Mes dossiers' },
      { to: '/dashboard', label: 'Suivi' },
    ],
    [ROLES.UNITE]: [
      { to: '/dossiers', label: 'Mes dossiers' },
      { to: '/dashboard', label: 'Suivi' },
    ],
    [ROLES.ADMIN]: [
      { to: '/admin/utilisateurs', label: 'Utilisateurs' },
      { to: '/campagnes', label: 'Campagnes' },
      { to: '/dossiers', label: 'Dossiers' },
    ],
  };

  return (
    <div className="page">
      <h2>Tableau de bord</h2>
      <div className="grid stats-grid">
        <Card title="Campagnes">
          <div className="stat-number">{stats.totalCampagnes}</div>
          <div className="muted">Total campagnes</div>
          <div className="pill">En cours: {stats.enCoursCampagnes}</div>
        </Card>
        <Card title="Dossiers">
          <div className="stat-number">{stats.totalDossiers}</div>
          <div className="muted">Dossiers suivis</div>
        </Card>
        <Card title="Localisés">
          <div className="stat-number">{stats.localises}</div>
          <div className="muted">Statut Localisé</div>
        </Card>
        <Card title="Transférés / Non localisés">
          <div className="stat-number">
            {stats.transferes} / {stats.nonLocalises}
          </div>
          <div className="muted">Transférés / Non localisés</div>
        </Card>
      </div>

      <div className="grid two-columns">
        <Card title="Campagnes actives">
          <ul className="list">
            {campagnes?.slice?.(0, 5).map((c) => (
              <li key={c.id || c.nom} className="list-item">
                <div>
                  <div className="list-title">{c.nom}</div>
                  <div className="muted">
                    {c.dateDebut} → {c.dateFin}
                  </div>
                </div>
                <span className={badgeClassByStatut(c.statut)}>{c.statut}</span>
              </li>
            ))}
            {!campagnes?.length && (
              <li className="muted">Aucune campagne disponible.</li>
            )}
          </ul>
        </Card>

        <Card title="Raccourcis">
          <div className="shortcuts">
            {shortcuts[role]?.map((s) => (
              <Link key={s.to} to={s.to} className="shortcut">
                {s.label}
              </Link>
            )) || <div className="muted">Aucun raccourci.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
