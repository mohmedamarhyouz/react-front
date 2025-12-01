import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadBRFile } from '../../api/brApi';
import Card from '../../components/Common/Card';

const BRUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => uploadBRFile(file),
    onSuccess: () => {
      setMessage('Fichier transmis au Service GR.');
      setError('');
      setFile(null);
    },
    onError: (err) => {
      setMessage('');
      setError(
        err?.response?.data?.message ||
          'Échec du téléversement, merci de réessayer.'
      );
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    mutation.mutate();
  };

  return (
    <div className="page">
      <h2>Transmettre fichier de réservistes (BR)</h2>
      <Card>
        <form className="form" onSubmit={onSubmit}>
          <label className="form-label">
            Sélectionner le fichier BR
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
          </label>
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!file || mutation.isPending}
          >
            {mutation.isPending ? 'Transmission...' : 'Envoyer'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default BRUpload;
