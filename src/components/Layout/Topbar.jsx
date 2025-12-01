import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
  const { user, roleLabel, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Suivi de localisation des réservistes</h1>
      </div>
      <div className="topbar-right">
        <div className="topbar-user">
          <span className="topbar-name">{user?.fullName || user?.email}</span>
          <span className="topbar-role">{roleLabel}</span>
        </div>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Topbar;
