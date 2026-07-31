import { useState, useMemo } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatCard from '../../components/admin/StatCard';
import ExposantPreviewModal from '../../components/admin/ExposantPreviewModal';
import AssignStandModal from '../../components/admin/AssignStandModal';
import { MOCK_EXPOSANTS, STATUT_LABELS } from '../../data/mockExposants';
import { MOCK_STANDS } from '../../data/mockStands';
import { PACKS } from '../../constants/packs';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  const [exposants, setExposants] = useState(MOCK_EXPOSANTS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewExposant, setPreviewExposant] = useState(null);
  const [assignExposant, setAssignExposant] = useState(null);

  // Build assignments map: { exposantId: standId }
  const assignments = useMemo(() => {
    const map = {};
    exposants.forEach((e) => {
      if (e.standId) map[e.id] = e.standId;
    });
    return map;
  }, [exposants]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = exposants;
    if (activeFilter !== 'all') {
      list = list.filter((e) => e.packId === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.raisonSociale.toLowerCase().includes(q) ||
          e.nomPrenom.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [exposants, activeFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = exposants.length;
    const contratsRecus = exposants.filter((e) => e.statutContrat === 'recu').length;
    const ca = exposants.reduce((sum, e) => sum + e.totalTTC, 0);
    const byPack = {};
    PACKS.forEach((p) => {
      byPack[p.id] = exposants.filter((e) => e.packId === p.id).length;
    });
    return { total, contratsRecus, ca, byPack };
  }, [exposants]);

  // Handlers
  const handleStatutChange = (id, newStatut) => {
    setExposants((prev) =>
      prev.map((e) => (e.id === id ? { ...e, statutContrat: newStatut } : e))
    );
  };

  const handleAssignStand = (exposantId, standId) => {
    setExposants((prev) =>
      prev.map((e) => (e.id === exposantId ? { ...e, standId } : e))
    );
  };

  const handleRemoveStand = (exposantId) => {
    setExposants((prev) =>
      prev.map((e) => (e.id === exposantId ? { ...e, standId: null } : e))
    );
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Raison Sociale', 'Gérant', 'Tél', 'Email', 'Pack', 'Statut Contrat', 'Stand', 'Total TTC'];
    const rows = filtered.map((e) => {
      const pack = PACKS.find((p) => p.id === e.packId);
      const statut = STATUT_LABELS[e.statutContrat];
      return [
        e.raisonSociale,
        e.nomPrenom,
        e.tel,
        e.email,
        pack?.name || '',
        statut.label,
        e.standId || 'Non attribué',
        e.totalTTC,
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

  const statutCycle = ['en_attente', 'recu', 'incomplet'];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-main__header">
          <h1>Tableau de bord</h1>
          <p>Gestion des exposants — KIDS WORLD FESTIVAL</p>
        </div>

        {/* KPIs */}
        <div className="admin-stats">
          <StatCard
            icon="📊"
            label="Total inscrits"
            value={stats.total}
            color="var(--color-secondary)"
          />
          <StatCard
            icon="📄"
            label="Contrats reçus"
            value={`${stats.contratsRecus} / ${stats.total}`}
            sub={`${Math.round((stats.contratsRecus / stats.total) * 100)}% complétés`}
            color="var(--color-success)"
          />
          <StatCard
            icon="💰"
            label="CA Prévisionnel TTC"
            value={`${(stats.ca / 1000000).toFixed(1)}M DA`}
            sub={`${stats.ca.toLocaleString('fr-DZ')} DA`}
            color="var(--color-accent-dark)"
          />
          <StatCard
            icon="📍"
            label="Stands attribués"
            value={`${Object.keys(assignments).length} / ${MOCK_STANDS.length}`}
            color="var(--color-primary)"
          />
        </div>

        {/* Filters */}
        <div className="admin-toolbar">
          <div className="admin-filters">
            <button
              className={`admin-filter ${activeFilter === 'all' ? 'admin-filter--active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Tous <span className="admin-filter__count">{exposants.length}</span>
            </button>
            {PACKS.map((pack) => (
              <button
                key={pack.id}
                className={`admin-filter ${activeFilter === pack.id ? 'admin-filter--active' : ''}`}
                onClick={() => setActiveFilter(pack.id)}
              >
                {pack.icon} {pack.name.replace('Formule ', '')}
                <span className="admin-filter__count">{stats.byPack[pack.id] || 0}</span>
              </button>
            ))}
          </div>

          <div className="admin-toolbar__right">
            <div className="admin-search">
              <span className="admin-search__icon">🔍</span>
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="admin-export" onClick={exportCSV}>
              📥 Exporter CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Raison Sociale</th>
                <th>Gérant</th>
                <th>Téléphone</th>
                <th>Pack</th>
                <th>Statut Contrat</th>
                <th>Emplacement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exposant, i) => {
                const pack = PACKS.find((p) => p.id === exposant.packId);
                const statut = STATUT_LABELS[exposant.statutContrat];

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
                        {pack?.icon} {pack?.name.replace('Formule ', '')}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-table__statut-btn"
                        style={{ color: statut.color, background: statut.bg }}
                        onClick={() => {
                          const idx = statutCycle.indexOf(exposant.statutContrat);
                          const next = statutCycle[(idx + 1) % statutCycle.length];
                          handleStatutChange(exposant.id, next);
                        }}
                        title="Cliquer pour changer le statut"
                      >
                        {statut.label}
                      </button>
                    </td>
                    <td>
                      {exposant.standId ? (
                        <span className="admin-table__stand">
                          📍 {exposant.standId}
                          <button
                            className="admin-table__stand-remove"
                            onClick={() => handleRemoveStand(exposant.id)}
                            title="Retirer l'emplacement"
                          >
                            ✕
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
                          title="Aperçu du bon de commande"
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="admin-table__empty">
              <span>📭</span>
              <p>Aucun exposant trouvé pour ce filtre.</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {previewExposant && (
          <ExposantPreviewModal
            exposant={previewExposant}
            onClose={() => setPreviewExposant(null)}
          />
        )}

        {assignExposant && (
          <AssignStandModal
            exposant={assignExposant}
            stands={MOCK_STANDS}
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
