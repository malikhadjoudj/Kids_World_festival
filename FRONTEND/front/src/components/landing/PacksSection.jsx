import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PACKS, DROITS_INTERVENTION, togglePackSelection } from '../../constants/packs';
import Button from '../common/Button';
import './PacksSection.css';

function PackCard({ pack, selected, onToggle }) {
  const { t } = useTranslation();
  const name = t(`packsData.${pack.id}.name`, pack.name);
  const surface = t(`packsData.${pack.id}.surface`, pack.surface);
  const features = t(`packsData.${pack.id}.features`, { returnObjects: true, defaultValue: pack.features });

  return (
    <div className={`pack-card ${pack.popular ? 'pack-card--popular' : ''} ${selected ? 'pack-card--selected' : ''}`}>
      {pack.popular && (
        <div className="pack-card__badge">{t('packs.mostRequested')}</div>
      )}

      <label className="pack-card__select">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(pack.id)}
        />
        <span>{selected ? t('packs.selected') : t('packs.add')}</span>
      </label>

      <div className="pack-card__header">
        <span className="pack-card__icon">{pack.icon}</span>
        <h3 className="pack-card__name">{name}</h3>
        {pack.subtitle && <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', opacity: 0.75 }}>{pack.subtitle}</p>}
        <div className="pack-card__price">
          <span className="pack-card__price-value">{pack.priceLabel}</span>
          {pack.perSquareMeter && (
            <span className="pack-card__price-unit">{t('packs.perSqm')}</span>
          )}
        </div>
        <span className="pack-card__surface">{surface}</span>
      </div>

      <div className="pack-card__divider"></div>

      <ul className="pack-card__features">
        {(Array.isArray(features) ? features : pack.features).map((feature, i) => (
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
          {selected ? t('packs.remove') : t('packs.chooseThis')}
        </Button>
      </div>
    </div>
  );
}

function PacksSection() {
  const { t } = useTranslation();
  const [selectedPackIds, setSelectedPackIds] = useState([]);
  const selectedPackParam = encodeURIComponent(selectedPackIds.join(','));

  const handleTogglePack = (packId) => {
    setSelectedPackIds((current) => togglePackSelection(current, packId));
  };

  const formulaPackIds = ['discover-fun', 'sell-win', 'espace-nu'];
  const formulaPacks = formulaPackIds
    .map((id) => PACKS.find((pack) => pack.id === id))
    .filter(Boolean);
  const sponsorPacks = PACKS.filter((pack) => pack.category === 'sponsor');

  return (
    <section className="packs" id="formules">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">{t('packs.sectionBadge')}</span>
          <h2 className="section-title">
            {t('packs.sectionTitle')}
          </h2>
          <p className="section-subtitle">
            {t('packs.sectionSubtitle')}
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
            <span className="section-badge">{t('packs.sponsorBadge')}</span>
            <h2 className="section-title">
              {t('packs.sponsorTitle')}
            </h2>
            <p className="section-subtitle">
              {t('packs.sponsorSubtitle')}
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
              {selectedPackIds.length || t('packs.none')}{' '}
              {selectedPackIds.length > 1 ? t('packs.formuleSelectedOther') : t('packs.formuleSelectedOne')}
            </strong>
            <p>{t('packs.combineNote')}</p>
          </div>
          {selectedPackIds.length > 0 ? (
            <Button
              variant="primary"
              size="lg"
              to={`/document-tarification?pack=${selectedPackParam}`}
              className="packs__selection-btn"
            >
              {t('packs.continue')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="packs__selection-btn"
              disabled
            >
              {t('packs.continue')}
            </Button>
          )}
        </div>

        <div className="packs__note">
          <span className="packs__note-icon">ℹ️</span>
          <p>
            <strong>{t('packs.droitsIntervention')}</strong>{' '}
            {DROITS_INTERVENTION.toLocaleString('fr-DZ')} {t('packs.droitsSuffix')}
          </p>
        </div>
      </div>
    </section>
  );
}

export default PacksSection;