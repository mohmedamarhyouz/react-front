import { useQuery } from '@tanstack/react-query';
import { fetchResultatsConsolides } from '../../api/brApi';
import Card from '../../components/Common/Card';

const ResultatsConsolides = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['resultats-consolides'],
    queryFn: async () => {
      const { data: resultats } = await fetchResultatsConsolides();
      return resultats;
    },
  });

  const lignes = data?.items || data || [];

  return (
    <div className="page">
      <h2>Résultats consolidés</h2>
      <Card>
        {isLoading ? (
          <div className="muted">Chargement...</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Campagne</th>
                  <th>Total dossiers</th>
                  <th>Localisés</th>
                  <th>Non localisés</th>
                  <th>Transférés</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l, idx) => (
                  <tr key={l.campagneId || idx}>
                    <td>{l.campagne || l.nom}</td>
                    <td>{l.total || l.totalDossiers}</td>
                    <td>{l.localises}</td>
                    <td>{l.nonLocalises}</td>
                    <td>{l.transferes}</td>
                  </tr>
                ))}
                {!lignes.length && (
                  <tr>
                    <td colSpan="5" className="muted">
                      Pas de résultats consolidés disponibles.
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

export default ResultatsConsolides;
