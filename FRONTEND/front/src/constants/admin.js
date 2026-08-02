export const STATUT_LABELS = {
  recu: { label: 'Contrat recu', color: 'var(--color-success)', bg: 'rgba(6, 214, 160, 0.12)' },
  en_attente: { label: 'En attente', color: 'var(--color-accent-dark)', bg: 'rgba(255, 209, 102, 0.15)' },
  incomplet: { label: 'Incomplet', color: 'var(--color-primary)', bg: 'rgba(255, 107, 53, 0.12)' },
};

export const getStatutLabel = (statutContrat) => {
  return STATUT_LABELS[statutContrat] || STATUT_LABELS.en_attente;
};
