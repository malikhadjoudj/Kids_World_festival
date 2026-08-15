import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatCard from '../../components/admin/StatCard';
import { fetchVisites, fetchVisitesStats } from '../../services/api';
import './VisitesPage.css';

const formatDate = (value) =>
  new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

function VisitesPage() {
  const [visites, setVisites] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [visitesData, statsData] = await Promise.all([fetchVisites(), fetchVisitesStats()]);
      setVisites(visitesData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Impossible de charger les visites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-main__header">
          <h1>Visites</h1>
          <p>Suivi des visiteurs de la plateforme - KIDS WORLD FESTIVAL</p>
        </div>

        {error && (
          <div className="admin-alert">
            {error}
            <button onClick={loadData}>Reessayer</button>
          </div>
        )}

        <div className="admin-stats">
          <StatCard
            icon="👤"
            label="Nouveaux visiteurs aujourd'hui"
            value={loading || !stats ? '...' : stats.visiteursUniquesAujourdhui}
            color="var(--color-secondary)"
          />
          <StatCard
            icon="👀"
            label="Visites aujourd'hui"
            value={loading || !stats ? '...' : stats.visitesAujourdhui}
            color="var(--color-success)"
          />
          <StatCard
            icon="🌍"
            label="Visiteurs uniques (total)"
            value={loading || !stats ? '...' : stats.totalVisiteursUniques}
            color="var(--color-accent-dark)"
          />
          <StatCard
            icon="📈"
            label="Total des visites"
            value={loading || !stats ? '...' : stats.totalVisites}
            color="var(--color-primary)"
          />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Page visitée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {visites.map((visite, i) => (
                <tr key={visite.id}>
                  <td className="admin-table__num">{i + 1}</td>
                  <td>{formatDate(visite.createdAt)}</td>
                  <td>{visite.page}</td>
                  <td>
                    {visite.isNewVisitor ? (
                      <span className="visites-badge visites-badge--new">Nouveau</span>
                    ) : (
                      <span className="visites-badge visites-badge--returning">Revenant</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && visites.length === 0 && (
            <div className="admin-table__empty">
              <span>--</span>
              <p>Aucune visite enregistrée pour le moment.</p>
            </div>
          )}

          {loading && (
            <div className="admin-table__empty">
              <span>...</span>
              <p>Chargement des visites...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default VisitesPage;