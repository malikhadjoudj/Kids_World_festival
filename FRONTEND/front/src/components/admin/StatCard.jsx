import './StatCard.css';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color || 'var(--color-primary)' }}>
      <span className="stat-card__icon">{icon}</span>
      <div className="stat-card__info">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
        {sub && <span className="stat-card__sub">{sub}</span>}
      </div>
    </div>
  );
}

export default StatCard;
