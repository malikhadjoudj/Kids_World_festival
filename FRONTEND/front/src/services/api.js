const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getStoredExposantId = () => {
  const fromSession = sessionStorage.getItem('exposantId');
  if (fromSession) return fromSession;

  const fromLocal = localStorage.getItem('exposantId');
  if (fromLocal) {
    sessionStorage.setItem('exposantId', fromLocal);
    return fromLocal;
  }

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('exposantId');
    if (fromUrl) {
      sessionStorage.setItem('exposantId', fromUrl);
      localStorage.setItem('exposantId', fromUrl);
      return fromUrl;
    }
  }

  return null;
};

export const setStoredExposantId = (id) => {
  if (!id) return;
  sessionStorage.setItem('exposantId', id);
  localStorage.setItem('exposantId', id);
};

export const setStoredPackSelection = (exposantId, packIds) => {
  if (!exposantId || !Array.isArray(packIds)) return;
  const value = packIds.join(',');
  sessionStorage.setItem(`packSelection:${exposantId}`, value);
  localStorage.setItem(`packSelection:${exposantId}`, value);
};

export const getStoredPackSelection = (exposantId) => {
  if (!exposantId) return '';
  return (
    sessionStorage.getItem(`packSelection:${exposantId}`) ||
    localStorage.getItem(`packSelection:${exposantId}`) ||
    ''
  );
};

// ─── PACKS ────────────────────────────────────────────────

export const fetchPacks = async () => {
  const res = await fetch(`${API_BASE}/packs`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des packs.');
  return res.json();
};

// ─── EXPOSANTS ────────────────────────────────────────────

export const fetchExposants = async () => {
  const res = await fetch(`${API_BASE}/exposants`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des exposants.');
  return res.json();
};

export const fetchExposantById = async (id) => {
  const res = await fetch(`${API_BASE}/exposants/${id}`);
  if (!res.ok) throw new Error('Erreur lors de la récupération de l\'exposant.');
  return res.json();
};

export const createExposant = async (data) => {
  const res = await fetch(`${API_BASE}/exposants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.error || 'Erreur lors de la soumission du dossier.');
    error.details = err.details || null;
    throw error;
  }
  return res.json();
};

export const updateExposant = async (id, data) => {
  const res = await fetch(`${API_BASE}/exposants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.error || 'Erreur lors de la mise à jour du dossier.');
    error.details = err.details || null;
    throw error;
  }
  return res.json();
};

export const updateExposantStatut = async (id, statutContrat) => {
  const res = await fetch(`${API_BASE}/exposants/${id}/statut`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statutContrat }),
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du statut.');
  return res.json();
};

export const assignStandToExposant = async (exposantId, standId) => {
  const res = await fetch(`${API_BASE}/exposants/${exposantId}/stand`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ standId }),
  });
  if (!res.ok) throw new Error('Erreur lors de l\'attribution du stand.');
  return res.json();
};

export const uploadDocument = async (exposantId, file) => {
  const formData = new FormData();
  formData.append('document', file);
  const res = await fetch(`${API_BASE}/exposants/${exposantId}/documents`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erreur lors de l\'envoi du document.');
  }
  return res.json();
};

// ─── STANDS ───────────────────────────────────────────────

export const fetchStands = async () => {
  const res = await fetch(`${API_BASE}/stands`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des stands.');
  return res.json();
};
