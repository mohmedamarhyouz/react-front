import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchDossier,
  confirmerAdresse,
  nouvelleAdresse,
  adresseInconnue,
  transfertDossier,
  marquerDecede,
  marquerEcroue,
  marquerEtranger,
  marquerInapte,
  casParticulier,
  aucuneAction,
} from '../../api/dossiersApi';
import { fetchBrigades } from '../../api/brigadesApi';
import { fetchPvFile } from '../../api/pvApi';
import { fetchBordereauFile } from '../../api/bordereauxApi';
import Card from '../../components/Common/Card';
import Badge from '../../components/Common/Badge';
import Modal from '../../components/Common/Modal';
import Timeline from '../../components/Timeline/Timeline';
import { badgeClassByStatut, formatDate } from '../../utils/formatters';

const DossierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [adresseModalOpen, setAdresseModalOpen] = useState(false);
  const [nouvelleAdr, setNouvelleAdr] = useState('');
  const [casParticulierFlag, setCasParticulierFlag] = useState(false);

  const [transfertModalOpen, setTransfertModalOpen] = useState(false);
  const [destinationBrigade, setDestinationBrigade] = useState('');
  const [transfertComment, setTransfertComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dossier', id],
    queryFn: async () => {
      const { data: dossierData } = await fetchDossier(id);
      return dossierData;
    },
  });

  const { data: brigades } = useQuery({
    queryKey: ['brigades'],
    queryFn: async () => {
      const { data: brigadesData } = await fetchBrigades();
      return brigadesData;
    },
  });

  const dossier = data?.dossier || data || {};

  const actionMutation = useMutation({
    mutationFn: (mutationFn) => mutationFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['dossier', id]);
      setMessage('Action enregistrée avec succès.');
    },
    onError: (err) => {
      setError(
        err?.response?.data?.message ||
          'Une erreur est survenue lors de l’exécution de l’action.'
      );
    },
  });

  const runAction = async (callback) => {
    setMessage('');
    setError('');
    await actionMutation.mutateAsync(callback);
  };

  const handleDownload = async (fn) => {
    const { data: blob } = await fn();
    const fileUrl = URL.createObjectURL(blob);
    window.open(fileUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="muted">Chargement du dossier...</div>
      </div>
    );
  }

  if (!dossier?.id) {
    return (
      <div className="page">
        <div className="muted">Dossier introuvable.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Dossier #{dossier.id}</p>
          <h2>
            {dossier.reserviste?.nom} {dossier.reserviste?.prenom}
          </h2>
          <p className="muted">
            Campagne: {dossier.campagne?.nom} — Brigade: {dossier.brigade?.nom}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/dossiers')}>
          Retour à la liste
        </button>
      </div>

      <div className="grid two-columns">
        <Card title="Réserviste">
          <div className="data-grid">
            <span>CIN</span>
            <span>{dossier.reserviste?.cin}</span>
            <span>Nom</span>
            <span>{dossier.reserviste?.nom}</span>
            <span>Prénom</span>
            <span>{dossier.reserviste?.prenom}</span>
            <span>Date de naissance</span>
            <span>{formatDate(dossier.reserviste?.dateNaissance)}</span>
            <span>Statut mobilisation</span>
            <Badge variant="info">{dossier.reserviste?.statutMobilisation}</Badge>
          </div>
        </Card>

        <Card title="Dossier">
          <div className="data-grid">
            <span>Statut localisation</span>
            <Badge variant={badgeClassByStatut(dossier.statutLocalisation)}>
              {dossier.statutLocalisation}
            </Badge>
            <span>Type</span>
            <span>{dossier.typeLocalisation}</span>
            <span>Adresse à investiguer</span>
            <span>{dossier.adresseInvestiguer}</span>
            <span>Date de réception</span>
            <span>{formatDate(dossier.dateReception)}</span>
            <span>Dernière mise à jour</span>
            <span>{formatDate(dossier.dateMiseAJour)}</span>
          </div>
        </Card>
      </div>

      <div className="grid two-columns">
        <Card title="Procès-verbaux">
          <ul className="list">
            {dossier.pvs?.map((pv) => (
              <li key={pv.id} className="list-item">
                <div>
                  <div className="list-title">
                    {pv.type} — {pv.numero}
                  </div>
                  <div className="muted">{formatDate(pv.date)}</div>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleDownload(() => fetchPvFile(pv.id))}
                >
                  Voir le PDF
                </button>
              </li>
            ))}
            {!dossier.pvs?.length && (
              <li className="muted">Aucun PV pour ce dossier.</li>
            )}
          </ul>
        </Card>

        <Card title="Bordereaux">
          <ul className="list">
            {dossier.bordereaux?.map((b) => (
              <li key={b.id} className="list-item">
                <div>
                  <div className="list-title">
                    {b.type} — {b.numero}
                  </div>
                  <div className="muted">{formatDate(b.date)}</div>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleDownload(() => fetchBordereauFile(b.id))}
                >
                  Ouvrir
                </button>
              </li>
            ))}
            {!dossier.bordereaux?.length && (
              <li className="muted">Aucun bordereau.</li>
            )}
          </ul>
        </Card>
      </div>

      <Card title="Historique des actions">
        <Timeline items={dossier.historique || []} />
      </Card>

      <Card title="Actions de localisation">
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
        <div className="actions-grid">
          <button
            className="btn btn-primary"
            onClick={() => runAction(() => confirmerAdresse(id))}
            disabled={actionMutation.isPending}
          >
            Confirmer adresse
          </button>

          <button
            className="btn"
            onClick={() => setAdresseModalOpen(true)}
            disabled={actionMutation.isPending}
          >
            Saisir nouvelle adresse
          </button>

          <button
            className="btn"
            onClick={() => runAction(() => adresseInconnue(id))}
            disabled={actionMutation.isPending}
          >
            Adresse inconnue / PV non-localisation
          </button>

          <button
            className="btn"
            onClick={() => setTransfertModalOpen(true)}
            disabled={actionMutation.isPending}
          >
            Adresse connue mais hors zone (Transfert)
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => runAction(() => marquerDecede(id))}
            disabled={actionMutation.isPending}
          >
            Décédé (PV)
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => runAction(() => marquerEcroue(id))}
            disabled={actionMutation.isPending}
          >
            Écroué (PV)
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => runAction(() => marquerEtranger(id))}
            disabled={actionMutation.isPending}
          >
            À l’étranger (PV)
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => runAction(() => marquerInapte(id))}
            disabled={actionMutation.isPending}
          >
            Inapte (PV)
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => runAction(() => casParticulier(id))}
            disabled={actionMutation.isPending}
          >
            Cas particulier – Générer PV obligatoire
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => runAction(() => aucuneAction(id))}
            disabled={actionMutation.isPending}
          >
            Aucune action requise
          </button>
        </div>
      </Card>

      <Modal
        open={adresseModalOpen}
        title="Nouvelle adresse"
        onClose={() => setAdresseModalOpen(false)}
      >
        <div className="form">
          <label className="form-label">
            Adresse
            <input
              type="text"
              value={nouvelleAdr}
              onChange={(e) => setNouvelleAdr(e.target.value)}
              placeholder="Nouvelle adresse trouvée"
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={casParticulierFlag}
              onChange={(e) => setCasParticulierFlag(e.target.checked)}
            />
            Cas particulier ? PV obligatoire
          </label>
          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={() =>
                runAction(() =>
                  nouvelleAdresse(id, {
                    adresse: nouvelleAdr,
                    casParticulier: casParticulierFlag,
                  })
                ).then(() => {
                  setAdresseModalOpen(false);
                  setNouvelleAdr('');
                  setCasParticulierFlag(false);
                })
              }
              disabled={!nouvelleAdr || actionMutation.isPending}
            >
              Valider
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setAdresseModalOpen(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={transfertModalOpen}
        title="Transfert hors zone"
        onClose={() => setTransfertModalOpen(false)}
      >
        <div className="form">
          <label className="form-label">
            Brigade de destination
            <select
              value={destinationBrigade}
              onChange={(e) => setDestinationBrigade(e.target.value)}
            >
              <option value="">Sélectionner une brigade</option>
              {brigades?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nom} — {b.zone}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Commentaire (optionnel)
            <textarea
              rows="3"
              value={transfertComment}
              onChange={(e) => setTransfertComment(e.target.value)}
              placeholder="Justification du transfert"
            />
          </label>
          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={() =>
                runAction(() =>
                  transfertDossier(id, {
                    brigadeId: destinationBrigade,
                    commentaire: transfertComment,
                  })
                ).then(() => {
                  setTransfertModalOpen(false);
                  setDestinationBrigade('');
                  setTransfertComment('');
                })
              }
              disabled={!destinationBrigade || actionMutation.isPending}
            >
              Transférer
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setTransfertModalOpen(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DossierDetail;
