import { useState } from 'react';
import { PACKS, DROITS_INTERVENTION, togglePackSelection } from '../../constants/packs';
import Button from '../common/Button';
import './PacksSection.css';

function PackCard({ pack, selected, onToggle }) {
  return (
    <div className={`pack-card ${pack.popular ? 'pack-card--popular' : ''} ${selected ? 'pack-card--selected' : ''}`}>
      {pack.popular && (
        <div className="pack-card__badge">⭐ Le plus demandé</div>
      )}

      <label className="pack-card__select">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(pack.id)}
        />
        <span>{selected ? 'Sélectionnée' : 'Ajouter'}</span>
      </label>

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
          onClick={() => onToggle(pack.id)}
          className="pack-card__btn"
        >
          {selected ? 'Retirer' : 'Choisir ce pack'}
        </Button>
      </div>
    </div>
  );
}

function PacksSection() {
  const [selectedPackIds, setSelectedPackIds] = useState([]);
  const selectedPackParam = encodeURIComponent(selectedPackIds.join(','));

  const handleTogglePack = (packId) => {
    setSelectedPackIds((current) => togglePackSelection(current, packId));
  };

  const formulaPackIds = ['standard', 'expo-plus', 'espace-vente', 'espace-nu'];
  const formulaPacks = formulaPackIds
    .map((id) => PACKS.find((pack) => pack.id === id))
    .filter(Boolean);
  const sponsorPacks = PACKS.filter((pack) => pack.category === 'sponsor');

  return (
    <section className="packs" id="formules">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">📦 Nos Formules</span>
          <h2 className="section-title">
            Choisissez la formule qui vous correspond
          </h2>
          <p className="section-subtitle">
            4 offres pensées pour s'adapter à chaque besoin, de l'espace clé en main
            à la liberté totale de configuration.
          </p>
        </div>

        <div className="packs__grid">
          {formulaPacks.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              selected={selectedPackIds.includes(pack.id)}
              onToggle={handleTogglePack}
            />
          ))}
        </div>

        <div className="packs__sponsor-section">
          <div className="section-header">
            <span className="section-badge">🚀 Nos Packs Sponsor</span>
            <h2 className="section-title">
              Découvrez les offres de sponsoring
            </h2>
            <p className="section-subtitle">
              3 packs sponsor dédiés pour renforcer votre visibilité sur le festival.
            </p>
          </div>

          <div className="packs__grid">
            {sponsorPacks.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                selected={selectedPackIds.includes(pack.id)}
                onToggle={handleTogglePack}
              />
            ))}
          </div>
        </div>

        <div className="packs__selection-bar">
          <div>
            <strong>
              {selectedPackIds.length || 'Aucune'} formule{selectedPackIds.length > 1 ? 's' : ''} sélectionnée{selectedPackIds.length > 1 ? 's' : ''}
            </strong>
            <p>Vous pouvez combiner une formule avec Espace Vente.</p>
          </div>
          {selectedPackIds.length > 0 ? (
            <Button
              variant="primary"
              size="lg"
              to={`/document-tarification?pack=${selectedPackParam}`}
              className="packs__selection-btn"
            >
              Continuer
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="packs__selection-btn"
              disabled
            >
              Continuer
            </Button>
          )}
        </div>

        <div className="packs__note">
          <span className="packs__note-icon">ℹ️</span>
          <p>
            <strong>Droits d'intervention obligatoires :</strong>{' '}
            {DROITS_INTERVENTION.toLocaleString('fr-DZ')} DA, appliqués en sus de chaque offre.
          </p>
        </div>
      </div>
    </section>
  );
}

export default PacksSection;
