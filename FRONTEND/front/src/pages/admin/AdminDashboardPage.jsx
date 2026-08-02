import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatCard from '../../components/admin/StatCard';
import ExposantPreviewModal from '../../components/admin/ExposantPreviewModal';
import AssignStandModal from '../../components/admin/AssignStandModal';
import {
  assignStandToExposant,
  fetchExposants,
  fetchPacks,
  fetchStands,
} from '../../services/api';
import { getStatutLabel } from '../../constants/admin';
import { PACKS as FALLBACK_PACKS } from '../../constants/packs';
import './AdminDashboardPage.css';

const getPackIds = (exposant) => {
  if (Array.isArray(exposant.packIds)) return exposant.packIds;
  if (typeof exposant.selectedPackIds === 'string') {
    const selectedIds = exposant.selectedPackIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (selectedIds.length > 0) return selectedIds;
  }
  return exposant.packId ? [exposant.packId] : [];
};

const getPackNames = (exposant, packs) => {
  return getPackIds(exposant)
    .map((id) => {
      if (exposant.pack?.id === id) return exposant.pack;
      return packs.find((pack) => pack.id === id) || { id, name: id };
    })
    .map((pack) => pack.name?.replace('Formule ', '') || pack.id)
    .join(' + ');
};

const hasReachedValidationStep = (exposant) => {
  return Boolean(
    exposant.hasUploadedDocuments ||
    exposant.documentParticipationNomPrenom ||
    exposant.documentParticipationEntreprise
  );
};

const enrichStandForDisplay = (stand, index) => {
  if (stand.zone) return stand;

  const prefix = stand.id?.charAt(0)?.toUpperCase();
  const zone = prefix === 'B' ? 'inter' : prefix === 'C' ? 'centre' : 'ext';
  const ring = prefix === 'B' ? 'middle' : prefix === 'C' ? 'inner' : 'outer';

  return {
    ...stand,
    zone,
    ring,
    angle: stand.angle ?? index * 30,
  };
};

const readAdminData = async () => {
  const [exposantsData, packsData, standsData] = await Promise.all([
    fetchExposants(),
    fetchPacks(),
    fetchStands(),
  ]);

  return {
    exposants: exposantsData.filter(hasReachedValidationStep),
    packs: packsData.length ? packsData : FALLBACK_PACKS,
    stands: standsData.map(enrichStandForDisplay),
  };
};

function AdminDashboardPage() {
  const [exposants, setExposants] = useState([]);
  const [packs, setPacks] = useState(FALLBACK_PACKS);
  const [stands, setStands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const statusFilters = [
    { id: 'all', label: 'Tous' },
    { id: 'recu', label: 'Contrats reçus' },
    { id: 'en_attente', label: 'En attente' },
  ];
  const visiblePackFilters = (packs || []).filter((pack) => pack.id !== 'food');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewExposant, setPreviewExposant] = useState(null);
  const [assignExposant, setAssignExposant] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await readAdminData();
      setExposants(data.exposants);
      setPacks(data.packs);
      setStands(data.stands);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Impossible de charger les donnees admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    readAdminData()
      .then((data) => {
        if (cancelled) return;
        setExposants(data.exposants);
        setPacks(data.packs);
        setStands(data.stands);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(err.message || 'Impossible de charger les donnees admin.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const assignments = useMemo(() => {
    const map = {};
    exposants.forEach((e) => {
      if (e.standId) map[e.id] = e.standId;
    });
    return map;
  }, [exposants]);

  const filtered = useMemo(() => {
    let list = exposants;

    if (activeFilter !== 'all' && !statusFilters.some((filter) => filter.id === activeFilter)) {
      list = list.filter((e) => getPackIds(e).includes(activeFilter));
    } else if (activeFilter !== 'all') {
      list = list.filter((e) => e.statutContrat === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => {
        return (
          e.raisonSociale?.toLowerCase().includes(q) ||
          e.nomPrenom?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [exposants, activeFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = exposants.length;
    const contratsRecus = exposants.filter((e) => e.statutContrat === 'recu').length;
    const ca = exposants.reduce((sum, e) => sum + Number(e.totalTTC || 0), 0);
    const byPack = {};

    packs.forEach((pack) => {
      byPack[pack.id] = exposants.filter((e) => getPackIds(e).includes(pack.id)).length;
    });

    return { total, contratsRecus, ca, byPack };
  }, [exposants, packs]);

  const handleAssignStand = async (exposantId, standId) => {
    try {
      const updated = await assignStandToExposant(exposantId, standId);
      setExposants((prev) =>
        prev.map((e) => (e.id === exposantId ? { ...e, ...updated } : e))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible d'attribuer l'emplacement.");
    }
  };

  const handleRemoveStand = async (exposantId) => {
    await handleAssignStand(exposantId, null);
  };

  const exportCSV = () => {
    const headers = ['Raison Sociale', 'Gerant', 'Tel', 'Email', 'Pack', 'Statut Contrat', 'Stand', 'Total TTC'];
    const rows = filtered.map((e) => {
      const statut = getStatutLabel(e.statutContrat);
      return [
        e.raisonSociale || '',
        e.nomPrenom || '',
        e.tel || '',
        e.email || '',
        getPackNames(e, packs),
        statut.label,
        e.standId || 'Non attribue',
        e.totalTTC || 0,
      ].join(';');
    });

    const csv = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exposants_kids_world_festival.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const completionRate = stats.total ? Math.round((stats.contratsRecus / stats.total) * 100) : 0;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-main__header">
          <h1>Tableau de bord</h1>
          <p>Gestion des exposants - KIDS WORLD FESTIVAL</p>
        </div>

        {error && (
          <div className="admin-alert">
            {error}
            <button onClick={loadAdminData}>
              Reessayer
            </button>
          </div>
        )}

        <div className="admin-stats">
          <StatCard
            icon="INS"
            label="Total inscrits"
            value={loading ? '...' : stats.total}
            color="var(--color-secondary)"
          />
          <StatCard
            icon="DOC"
            label="Contrats recus"
            value={loading ? '...' : `${stats.contratsRecus} / ${stats.total}`}
            sub={`${completionRate}% completes`}
            color="var(--color-success)"
          />
          <StatCard
            icon="DA"
            label="CA Previsionnel TTC"
            value={loading ? '...' : `${(stats.ca / 1000000).toFixed(1)}M DA`}
            sub={`${stats.ca.toLocaleString('fr-DZ')} DA`}
            color="var(--color-accent-dark)"
          />
          <StatCard
            icon="STD"
            label="Stands attribues"
            value={loading ? '...' : `${Object.keys(assignments).length} / ${stands.length}`}
            color="var(--color-primary)"
          />
        </div>

        <div className="admin-toolbar">
          <div className="admin-filters">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                className={`admin-filter ${activeFilter === filter.id ? 'admin-filter--active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                <span className="admin-filter__count">
                  {filter.id === 'all'
                    ? exposants.length
                    : exposants.filter((e) => e.statutContrat === filter.id).length}
                </span>
              </button>
            ))}
            {visiblePackFilters.map((pack) => (
              <button
                key={pack.id}
                className={`admin-filter ${activeFilter === pack.id ? 'admin-filter--active' : ''}`}
                onClick={() => setActiveFilter(pack.id)}
              >
                {pack.icon} {pack.name?.replace('Formule ', '')}
                <span className="admin-filter__count">{stats.byPack[pack.id] || 0}</span>
              </button>
            ))}
          </div>

          <div className="admin-toolbar__right">
            <div className="admin-search">
              <span className="admin-search__icon">Rech.</span>
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="admin-export" onClick={exportCSV} disabled={loading}>
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Raison Sociale</th>
                <th>Gerant</th>
                <th>Telephone</th>
                <th>Pack</th>
                <th>Statut Contrat</th>
                <th>Emplacement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exposant, i) => {
                const packLabel = getPackNames(exposant, packs);
                const statut = getStatutLabel(exposant.statutContrat);

                return (
                  <tr key={exposant.id}>
                    <td className="admin-table__num">{i + 1}</td>
                    <td>
                      <div className="admin-table__company">
                        <strong>{exposant.raisonSociale}</strong>
                        <span>{exposant.activite}</span>
                      </div>
                    </td>
                    <td>{exposant.nomPrenom}</td>
                    <td>{exposant.tel}</td>
                    <td>
                      <span className="admin-table__pack-badge">
                        {packLabel}
                      </span>
                    </td>
                    <td>
                      <span
                        className="admin-table__statut-btn admin-table__statut-btn--readonly"
                        style={{ color: statut.color, background: statut.bg }}
                      >
                        {statut.label}
                      </span>
                    </td>
                    <td>
                      {exposant.standId ? (
                        <span className="admin-table__stand">
                          Stand {exposant.standId}
                          <button
                            className="admin-table__stand-remove"
                            onClick={() => handleRemoveStand(exposant.id)}
                            title="Retirer l'emplacement"
                          >
                            x
                          </button>
                        </span>
                      ) : (
                        <button
                          className="admin-table__assign-btn"
                          onClick={() => setAssignExposant(exposant)}
                        >
                          + Attribuer
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className="admin-table__action"
                          onClick={() => setPreviewExposant(exposant)}
                          title={exposant.hasUploadedDocuments ? 'Voir les documents envoyes' : 'Dossier en attente de documents'}
                        >
                          Voir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="admin-table__empty">
              <span>--</span>
              <p>Aucun exposant trouve pour ce filtre.</p>
            </div>
          )}

          {loading && (
            <div className="admin-table__empty">
              <span>...</span>
              <p>Chargement des vrais dossiers...</p>
            </div>
          )}
        </div>

        {previewExposant && (
          <ExposantPreviewModal
            exposant={previewExposant}
            onClose={() => setPreviewExposant(null)}
          />
        )}

        {assignExposant && (
          <AssignStandModal
            exposant={assignExposant}
            stands={stands}
            assignments={assignments}
            onAssign={handleAssignStand}
            onClose={() => setAssignExposant(null)}
          />
        )}
      </main>
    </div>
  );
}

export default AdminDashboardPage;
