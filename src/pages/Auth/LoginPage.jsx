import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Échec de connexion, merci de vérifier vos identifiants.'
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Portail de localisation</h1>
        <p className="muted">Authentifiez-vous pour continuer</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-label">
            Email / Identifiant
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="prenom.nom@exemple.ma"
            />
          </label>
          <label className="form-label">
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
