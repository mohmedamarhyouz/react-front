import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchReservistes } from '../../api/reservistesApi';
import Card from '../../components/Common/Card';
import { formatDate } from '../../utils/formatters';

const ReservistesList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['reservistes'],
    queryFn: async () => {
      const { data: reservistes } = await fetchReservistes();
      return reservistes;
    },
  });

  const reservistes = data?.items || data || [];

  return (
    <div className="page">
      <h2>Réservistes</h2>
      <Card>
        {isLoading ? (
          <div className="muted">Chargement...</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>CIN</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date de naissance</th>
                  <th>Statut mobilisation</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reservistes.map((r) => (
                  <tr key={r.cin}>
                    <td>{r.cin}</td>
                    <td>{r.nom}</td>
                    <td>{r.prenom}</td>
                    <td>{formatDate(r.dateNaissance)}</td>
                    <td>{r.statutMobilisation}</td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={() => navigate(`/dossiers?cin=${r.cin}`)}
                      >
                        Voir dossiers
                      </button>
                    </td>
                  </tr>
                ))}
                {!reservistes.length && (
                  <tr>
                    <td colSpan="6" className="muted">
                      Aucun réserviste trouvé.
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

export default ReservistesList;
