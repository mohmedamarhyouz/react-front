import { createApp } from 'json-server/lib/app.js';
import { JSONFilePreset } from 'lowdb/node';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, 'db.json');

// lowdb requires default data even if the file already exists
const defaultData = {
  reservistes: [],
  campagnes: [],
  brigades: [],
  dossiers: [],
  users: [],
};

const db = await JSONFilePreset(dbFile, defaultData);
const app = createApp(db);

const nowIso = () => new Date().toISOString();

const updateDossier = async (id, changes, actionLabel, commentaire = '') => {
  const dossier = db.data.dossiers.find((d) => String(d.id) === String(id));
  if (!dossier) return null;
  const historyEntry = actionLabel
    ? {
        id: Date.now(),
        date: nowIso(),
        utilisateur: 'mock.user',
        action: actionLabel,
        commentaire,
      }
    : null;
  const updated = {
    ...dossier,
    ...changes,
    dateMiseAJour: nowIso(),
    historique: historyEntry
      ? [historyEntry, ...(dossier.historique || [])]
      : dossier.historique,
  };
  const index = db.data.dossiers.findIndex((d) => String(d.id) === String(id));
  db.data.dossiers[index] = updated;
  await db.write();
  return updated;
};

// Authentication mock
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body || {};
  const user =
    db.data.users.find((u) => u.email === email) || db.data.users.at(0) || {};
  res.json({
    token: 'fake-jwt-token',
    role: user.role || 'GR',
    user,
  });
});

// Dossiers list with filters
app.get('/api/dossiers', (req, res) => {
  const { cin, nom, brigadeId, campagneId, statutLocalisation, typeLocalisation } =
    req.query;
  let dossiers = db.data.dossiers || [];
  if (cin) dossiers = dossiers.filter((d) => d.reserviste?.cin?.includes(cin));
  if (nom)
    dossiers = dossiers.filter(
      (d) =>
        d.reserviste?.nom?.toLowerCase().includes(nom.toLowerCase()) ||
        d.reserviste?.prenom?.toLowerCase().includes(nom.toLowerCase())
    );
  if (brigadeId)
    dossiers = dossiers.filter(
      (d) => String(d.brigade?.id) === String(brigadeId)
    );
  if (campagneId)
    dossiers = dossiers.filter(
      (d) => String(d.campagne?.id) === String(campagneId)
    );
  if (statutLocalisation)
    dossiers = dossiers.filter((d) => d.statutLocalisation === statutLocalisation);
  if (typeLocalisation)
    dossiers = dossiers.filter((d) => d.typeLocalisation === typeLocalisation);

  res.json({ items: dossiers, total: dossiers.length });
});

// Single dossier
app.get('/api/dossiers/:id', (req, res) => {
  const dossier = db.data.dossiers.find(
    (d) => String(d.id) === String(req.params.id)
  );
  if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });
  res.json(dossier);
});

// Actions
app.post('/api/dossiers/:id/confirmer-adresse', async (req, res) => {
  const updated = await updateDossier(
    req.params.id,
    { statutLocalisation: 'Localise', typeLocalisation: 'Reference' },
    'Adresse confirmée'
  );
  if (!updated) return res.status(404).end();
  res.json(updated);
});

app.post('/api/dossiers/:id/nouvelle-adresse', async (req, res) => {
  const { adresse, casParticulier } = req.body || {};
  const updated = await updateDossier(
    req.params.id,
    {
      adresseInvestiguer: adresse || 'Adresse mise à jour',
      statutLocalisation: 'Localise',
      typeLocalisation: 'NouvelleAdresse',
    },
    casParticulier ? 'Cas particulier - PV obligatoire' : 'Nouvelle adresse',
    adresse
  );
  if (!updated) return res.status(404).end();
  res.json(updated);
});

app.post('/api/dossiers/:id/adresse-inconnue', async (req, res) => {
  const updated = await updateDossier(
    req.params.id,
    { statutLocalisation: 'NonLocalise', typeLocalisation: 'Inconnue' },
    'Adresse inconnue / PV non-localisation'
  );
  if (!updated) return res.status(404).end();
  res.json(updated);
});

app.post('/api/dossiers/:id/transfert', async (req, res) => {
  const { brigadeId, commentaire } = req.body || {};
  const brigade = db.data.brigades.find((b) => String(b.id) === String(brigadeId));
  const updated = await updateDossier(
    req.params.id,
    {
      statutLocalisation: 'Transfere',
      typeLocalisation: 'Reference',
      brigade: brigade || null,
    },
    'Transfert vers autre brigade',
    commentaire || 'Transfert'
  );
  if (!updated) return res.status(404).end();
  res.json(updated);
});

const markWithType = (type, actionLabel) => async (req, res) => {
  const updated = await updateDossier(
    req.params.id,
    { statutLocalisation: 'Localise', typeLocalisation: type },
    actionLabel
  );
  if (!updated) return res.status(404).end();
  res.json(updated);
};

app.post('/api/dossiers/:id/marquer-decede', markWithType('Decede', 'PV Décédé'));
app.post('/api/dossiers/:id/marquer-ecroue', markWithType('Ecroue', 'PV Écroué'));
app.post('/api/dossiers/:id/marquer-etranger', markWithType('A_Etranger', 'PV Étranger'));
app.post('/api/dossiers/:id/marquer-inapte', markWithType('Inapte', 'PV Inapte'));
app.post('/api/dossiers/:id/cas-particulier', markWithType('NouvelleAdresse', 'Cas particulier'));
app.post('/api/dossiers/:id/aucune-action', async (req, res) => {
  const updated = await updateDossier(req.params.id, {}, 'Aucune action requise');
  if (!updated) return res.status(404).end();
  res.json(updated);
});

// Campagnes, brigades, réservistes, users
app.get('/api/campagnes', (req, res) => {
  const campagnes = db.data.campagnes || [];
  res.json({ items: campagnes, total: campagnes.length });
});

app.get('/api/campagnes/:id', (req, res) => {
  const campagne = db.data.campagnes.find(
    (c) => String(c.id) === String(req.params.id)
  );
  if (!campagne) return res.status(404).json({ message: 'Campagne introuvable' });
  res.json(campagne);
});

app.post('/api/campagnes', async (req, res) => {
  const campagnes = db.data.campagnes || [];
  const nextId =
    campagnes.reduce((max, c) => (c.id > max ? c.id : max), 0) + 1;
  const newCampagne = { id: nextId, statut: 'Planifiee', ...req.body };
  db.data.campagnes.push(newCampagne);
  await db.write();
  res.status(201).json(newCampagne);
});

app.get('/api/brigades', (req, res) => {
  res.json(db.data.brigades || []);
});

app.get('/api/reservistes', (req, res) => {
  res.json(db.data.reservistes || []);
});

app.get('/api/reservistes/:cin', (req, res) => {
  const reserviste = db.data.reservistes.find((r) => r.cin === req.params.cin);
  if (!reserviste)
    return res.status(404).json({ message: 'Réserviste introuvable' });
  res.json(reserviste);
});

app.get('/api/users', (req, res) => {
  res.json(db.data.users || []);
});

app.post('/api/users', async (req, res) => {
  const users = db.data.users || [];
  const nextId =
    users.reduce((max, u) => (u.id > max ? u.id : max), 0) + 1;
  const newUser = { id: nextId, ...req.body };
  db.data.users.push(newUser);
  await db.write();
  res.status(201).json(newUser);
});

// PV & Bordereaux file endpoints
app.get('/api/pv/:id/fichier', (req, res) => {
  res.set('Content-Type', 'application/pdf');
  res.send(Buffer.from(`Fake PDF contenu pour PV ${req.params.id}`));
});

app.get('/api/bordereaux/:id/fichier', (req, res) => {
  res.set('Content-Type', 'application/pdf');
  res.send(Buffer.from(`Fake PDF contenu pour Bordereau ${req.params.id}`));
});

// BR upload & résultats
app.post('/api/br/upload-fichier', (req, res) => {
  res.json({ message: 'Fichier BR reçu (mock)' });
});
app.get('/api/gr/resultats', (req, res) => {
  const campagnes = db.data.campagnes || [];
  const dossiers = db.data.dossiers || [];
  const aggregats = campagnes.map((c) => {
    const ds = dossiers.filter((d) => d.campagne?.id === c.id);
    return {
      campagneId: c.id,
      campagne: c.nom,
      total: ds.length,
      localises: ds.filter((d) => d.statutLocalisation === 'Localise').length,
      nonLocalises: ds.filter((d) => d.statutLocalisation === 'NonLocalise').length,
      transferes: ds.filter((d) => d.statutLocalisation === 'Transfere').length,
    };
  });
  res.json(aggregats);
});

const port = process.env.MOCK_PORT || 4000;
app.listen(port, () => {
  console.log(`Mock API en écoute sur http://localhost:${port}`);
});
