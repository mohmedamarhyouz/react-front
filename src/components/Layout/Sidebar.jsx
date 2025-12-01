import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';

const getMenuForRole = (role) => {
  switch (role) {
    case ROLES.BR:
      return [
        { path: '/dashboard', label: 'Tableau de bord' },
        { path: '/br/upload', label: 'Transmettre fichier de réservistes' },
        { path: '/br/resultats', label: 'Résultats consolidés' },
        { path: '/campagnes', label: 'Campagnes' },
      ];
    case ROLES.GR:
      return [
        { path: '/dashboard', label: 'Tableau de bord' },
        { path: '/campagnes', label: 'Campagnes de localisation' },
        { path: '/dossiers', label: 'Dossiers de localisation' },
        { path: '/gr/assignation', label: 'Dossiers à répartir' },
      ];
    case ROLES.BRIGADE:
    case ROLES.UNITE:
      return [
        { path: '/dashboard', label: 'Tableau de bord' },
        { path: '/dossiers', label: 'Mes dossiers' },
      ];
    case ROLES.ADMIN:
      return [
        { path: '/dashboard', label: 'Tableau de bord' },
        { path: '/admin/utilisateurs', label: 'Gestion des utilisateurs' },
        { path: '/campagnes', label: 'Campagnes' },
        { path: '/dossiers', label: 'Dossiers' },
      ];
    default:
      return [{ path: '/dashboard', label: 'Tableau de bord' }];
  }
};

const Sidebar = () => {
  const { role } = useAuth();
  const menu = getMenuForRole(role);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-acronym">RLM</div>
        <div>
          <div className="brand-title">Réservistes</div>
          <div className="brand-subtitle">Localisation</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
