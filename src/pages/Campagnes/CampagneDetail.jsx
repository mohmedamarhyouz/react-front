import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCampagne } from '../../api/campagnesApi';
import { fetchDossiers } from '../../api/dossiersApi';
import Card from '../../components/Common/Card';
import Badge from '../../components/Common/Badge';
import { badgeClassByStatut, formatDate } from '../../utils/formatters';

const CampagneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: campagne } = useQuery({
    queryKey: ['campagne', id],
    queryFn: async () => {
      const { data } = await fetchCampagne(id);
      return data;
    },
  });

  const { data: dossiersData } = useQuery({
    queryKey: ['dossiers', 'campagne', id],
    queryFn: async () => {
      const { data } = await fetchDossiers({ campagneId: id, pageSize: 200 });
      return data;
    },
  });

  const dossiers =
    dossiersData?.items || dossiersData?.dossiers || dossiersData || [];

  const stats = {
    total: dossiers.length,
    localises: dossiers.filter((d) => d.statutLocalisation === 'Localise')
      .length,
    nonLocalises: dossiers.filter(
      (d) => d.statutLocalisation === 'NonLocalise'
    ).length,
    transferes: dossiers.filter((d) => d.statutLocalisation === 'Transfere')
      .length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Campagne #{campagne?.id}</p>
          <h2>{campagne?.nom}</h2>
          <p className="muted">
            {campagne?.dateDebut} → {campagne?.dateFin}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>

      <div className="grid stats-grid">
        <Card title="Total dossiers">
          <div className="stat-number">{stats.total}</div>
        </Card>
        <Card title="Localisés">
          <div className="stat-number">{stats.localises}</div>
        </Card>
        <Card title="Non localisés">
          <div className="stat-number">{stats.nonLocalises}</div>
        </Card>
        <Card title="Transférés">
          <div className="stat-number">{stats.transferes}</div>
        </Card>
      </div>

      <Card title="Dossiers de la campagne">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>CIN</th>
                <th>Nom & prénom</th>
                <th>Brigade</th>
                <th>Statut</th>
                <th>Type</th>
                <th>Date réception</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map((d) => (
                <tr
                  key={d.id}
                  className="clickable-row"
                  onClick={() => navigate(`/dossiers/${d.id}`)}
                >
                  <td>{d.reserviste?.cin}</td>
                  <td>
                    {d.reserviste?.nom} {d.reserviste?.prenom}
                  </td>
                  <td>{d.brigade?.nom}</td>
                  <td>
                    <Badge variant={badgeClassByStatut(d.statutLocalisation)}>
                      {d.statutLocalisation}
                    </Badge>
                  </td>
                  <td>{d.typeLocalisation}</td>
                  <td>{formatDate(d.dateReception)}</td>
                </tr>
              ))}
              {!dossiers.length && (
                <tr>
                  <td colSpan="6" className="muted">
                    Aucun dossier sur cette campagne.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CampagneDetail;
