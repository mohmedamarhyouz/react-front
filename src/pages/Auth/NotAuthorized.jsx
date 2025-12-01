import { Link } from 'react-router-dom';

const NotAuthorized = () => (
  <div className="page">
    <h2>Accès non autorisé</h2>
    <p>Vous n&apos;avez pas les droits nécessaires pour consulter cette page.</p>
    <Link className="btn btn-primary" to="/dashboard">
      Retour au tableau de bord
    </Link>
  </div>
);

export default NotAuthorized;
