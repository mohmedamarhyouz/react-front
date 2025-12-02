import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const nowIso = () => new Date().toISOString();

const updateDossier = (id, changes, actionLabel, commentaire = '') => {
  const db = router.db;
  const dossier = db.get('dossiers').find({ id: Number(id) }).value();
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

  db.get('dossiers').find({ id: Number(id) }).assign(updated).write();
  return updated;
};

// Authentication mock: accept anything and return a role based on email
server.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user =
    router.db.get('users').find({ email }).value() ||
    router.db.get('users').first().value();
  res.json({
    token: 'fake-jwt-token',
    role: user?.role || 'GR',
    user,
  });
});

// Dossiers list with basic filters
server.get('/api/dossiers', (req, res) => {
  const { cin, nom, brigadeId, campagneId, statutLocalisation, typeLocalisation } =
    req.query;
  let dossiers = router.db.get('dossiers').value();
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
server.get('/api/dossiers/:id', (req, res) => {
  const dossier = router.db
    .get('dossiers')
    .find({ id: Number(req.params.id) })
    .value();
  if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });
  res.json(dossier);
});

// Actions
server.post('/api/dossiers/:id/confirmer-adresse', (req, res) => {
  const updated = updateDossier(
    req.params.id,
    { statutLocalisation: 'Localise', typeLocalisation: 'Reference' },
    'Adresse confirmée'
  );
  if (!updated) return res.status(404).end();
  res.json(updated);
});

server.post('/api/dossiers/:id/nouvelle-adresse', (req, res) => {
  const { adresse, casParticulier } = req.body || {};
  const updated = updateDossier(
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

server.post('/api/dossiers/:id/adresse-inconnue', (req, res) => {
  const updated = updateDossier(
    req.params.id,
    { statutLocalisation: 'NonLocalise', typeLocalisation: 'Inconnue' },
    'Adresse inconnue / PV non-localisation'
  );
  if (!updated) return res.status(404).end();
  res.json(updated);
});

server.post('/api/dossiers/:id/transfert', (req, res) => {
  const { brigadeId, commentaire } = req.body || {};
  const brigade = router.db.get('brigades').find({ id: Number(brigadeId) }).value();
  const updated = updateDossier(
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

const markWithType = (type, actionLabel) => (req, res) => {
  const updated = updateDossier(
    req.params.id,
    { statutLocalisation: 'Localise', typeLocalisation: type },
    actionLabel
  );
  if (!updated) return res.status(404).end();
  res.json(updated);
};

server.post('/api/dossiers/:id/marquer-decede', markWithType('Decede', 'PV Décédé'));
server.post('/api/dossiers/:id/marquer-ecroue', markWithType('Ecroue', 'PV Écroué'));
server.post('/api/dossiers/:id/marquer-etranger', markWithType('A_Etranger', 'PV Étranger'));
server.post('/api/dossiers/:id/marquer-inapte', markWithType('Inapte', 'PV Inapte'));
server.post('/api/dossiers/:id/cas-particulier', markWithType('NouvelleAdresse', 'Cas particulier'));
server.post('/api/dossiers/:id/aucune-action', (req, res) => {
  const updated = updateDossier(req.params.id, {}, 'Aucune action requise');
  if (!updated) return res.status(404).end();
  res.json(updated);
});

// Campagnes, brigades, réservistes, users passthrough
server.get('/api/campagnes', (req, res) => {
  const campagnes = router.db.get('campagnes').value();
  res.json({ items: campagnes, total: campagnes.length });
});
server.get('/api/campagnes/:id', (req, res) => {
  const campagne = router.db
    .get('campagnes')
    .find({ id: Number(req.params.id) })
    .value();
  if (!campagne) return res.status(404).json({ message: 'Campagne introuvable' });
  res.json(campagne);
});
server.post('/api/campagnes', (req, res) => {
  const campagnes = router.db.get('campagnes');
  const nextId = (campagnes.map('id').max().value() || 0) + 1;
  const newCampagne = { id: nextId, statut: 'Planifiee', ...req.body };
  campagnes.push(newCampagne).write();
  res.status(201).json(newCampagne);
});

server.get('/api/brigades', (req, res) => {
  res.json(router.db.get('brigades').value());
});

server.get('/api/reservistes', (req, res) => {
  res.json(router.db.get('reservistes').value());
});

server.get('/api/reservistes/:cin', (req, res) => {
  const reserviste = router.db
    .get('reservistes')
    .find({ cin: req.params.cin })
    .value();
  if (!reserviste) return res.status(404).json({ message: 'Réserviste introuvable' });
  res.json(reserviste);
});

server.get('/api/users', (req, res) => {
  res.json(router.db.get('users').value());
});
server.post('/api/users', (req, res) => {
  const users = router.db.get('users');
  const nextId = (users.map('id').max().value() || 0) + 1;
  const newUser = { id: nextId, ...req.body };
  users.push(newUser).write();
  res.status(201).json(newUser);
});

// PV & Bordereaux file endpoints
server.get('/api/pv/:id/fichier', (req, res) => {
  res.set('Content-Type', 'application/pdf');
  res.send(Buffer.from(`Fake PDF contenu pour PV ${req.params.id}`));
});
server.get('/api/bordereaux/:id/fichier', (req, res) => {
  res.set('Content-Type', 'application/pdf');
  res.send(Buffer.from(`Fake PDF contenu pour Bordereau ${req.params.id}`));
});

// BR upload & résultats
server.post('/api/br/upload-fichier', (req, res) => {
  res.json({ message: 'Fichier BR reçu (mock)' });
});
server.get('/api/gr/resultats', (req, res) => {
  const campagnes = router.db.get('campagnes').value();
  const dossiers = router.db.get('dossiers').value();
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

// Mount the default router under /api for fallback CRUD
server.use('/api', router);

const port = process.env.MOCK_PORT || 4000;
server.listen(port, () => {
  console.log(`Mock API en écoute sur http://localhost:${port}`);
});
