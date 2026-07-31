import { PACKS, DROITS_INTERVENTION } from '../../constants/packs';
import Button from '../common/Button';
import './PacksSection.css';

function PackCard({ pack }) {
  return (
    <div className={`pack-card ${pack.popular ? 'pack-card--popular' : ''}`}>
      {pack.popular && (
        <div className="pack-card__badge">⭐ Le plus demandé</div>
      )}

      <div className="pack-card__header">
        <span className="pack-card__icon">{pack.icon}</span>
        <h3 className="pack-card__name">{pack.name}</h3>
        <div className="pack-card__price">
          <span className="pack-card__price-value">{pack.priceLabel}</span>
          {pack.perSquareMeter && (
            <span className="pack-card__price-unit">par m²</span>
          )}
        </div>
        <span className="pack-card__surface">{pack.surface}</span>
      </div>

      <div className="pack-card__divider"></div>

      <ul className="pack-card__features">
        {pack.features.map((feature, i) => (
          <li key={i} className="pack-card__feature">
            <span className="pack-card__feature-check">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="pack-card__action">
        <Button
          variant={pack.popular ? 'primary' : 'outline-dark'}
          size="md"
          to={`/commande?pack=${pack.id}`}
          className="pack-card__btn"
        >
          Choisir cette formule
        </Button>
      </div>
    </div>
  );
}

function PacksSection() {
  return (
    <section className="packs" id="formules">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">📦 Nos Formules</span>
          <h2 className="section-title">
            Choisissez la formule qui vous correspond
          </h2>
          <p className="section-subtitle">
            4 offres pensées pour s'adapter à chaque besoin — de l'espace clé en main
            à la liberté totale de configuration.
          </p>
        </div>

        <div className="packs__grid">
          {PACKS.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>

        <div className="packs__note">
          <span className="packs__note-icon">ℹ️</span>
          <p>
            <strong>Droits d'intervention obligatoires :</strong>{' '}
            {DROITS_INTERVENTION.toLocaleString('fr-DZ')} DA — appliqués en sus de chaque formule.
          </p>
        </div>
      </div>
    </section>
  );
}

export default PacksSection;
