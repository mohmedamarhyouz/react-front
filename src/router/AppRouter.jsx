import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/Auth/LoginPage';
import NotAuthorized from '../pages/Auth/NotAuthorized';
import HomePage from '../pages/Dashboard/HomePage';
import DossiersList from '../pages/Dossiers/DossiersList';
import DossierDetail from '../pages/Dossiers/DossierDetail';
import CampagnesList from '../pages/Campagnes/CampagnesList';
import CampagneDetail from '../pages/Campagnes/CampagneDetail';
import ReservistesList from '../pages/Reservistes/ReservistesList';
import BRUpload from '../pages/BR/BRUpload';
import ResultatsConsolides from '../pages/BR/ResultatsConsolides';
import AssignationDossiers from '../pages/GR/AssignationDossiers';
import GestionUtilisateurs from '../pages/Admin/GestionUtilisateurs';
import { ROLES } from '../utils/roles';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/unauthorized" element={<NotAuthorized />} />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<HomePage />} />
      <Route path="dashboard" element={<HomePage />} />

      <Route
        path="dossiers"
        element={
          <ProtectedRoute
            roles={[ROLES.GR, ROLES.BRIGADE, ROLES.UNITE, ROLES.ADMIN]}
          >
            <DossiersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="dossiers/:id"
        element={
          <ProtectedRoute
            roles={[ROLES.GR, ROLES.BRIGADE, ROLES.UNITE, ROLES.ADMIN]}
          >
            <DossierDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="campagnes"
        element={
          <ProtectedRoute roles={[ROLES.GR, ROLES.BR, ROLES.ADMIN]}>
            <CampagnesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="campagnes/:id"
        element={
          <ProtectedRoute roles={[ROLES.GR, ROLES.BR, ROLES.ADMIN]}>
            <CampagneDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="reservistes"
        element={
          <ProtectedRoute roles={[ROLES.GR, ROLES.BR, ROLES.ADMIN]}>
            <ReservistesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="br/upload"
        element={
          <ProtectedRoute roles={[ROLES.BR]}>
            <BRUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="br/resultats"
        element={
          <ProtectedRoute roles={[ROLES.BR, ROLES.GR]}>
            <ResultatsConsolides />
          </ProtectedRoute>
        }
      />

      <Route
        path="gr/assignation"
        element={
          <ProtectedRoute roles={[ROLES.GR]}>
            <AssignationDossiers />
          </ProtectedRoute>
        }
      />

      <Route
        path="admin/utilisateurs"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <GestionUtilisateurs />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
