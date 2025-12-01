export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('fr-FR');
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const badgeClassByStatut = (statut) => {
  switch (statut) {
    case 'Localise':
      return 'badge badge-success';
    case 'EnCours':
      return 'badge badge-info';
    case 'NonLocalise':
      return 'badge badge-warning';
    case 'Transfere':
      return 'badge badge-neutral';
    default:
      return 'badge badge-neutral';
  }
};
