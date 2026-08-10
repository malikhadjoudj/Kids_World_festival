import { useTranslation } from 'react-i18next';
import './EventLocationSection.css';


function EventLocationSection() {
  const { t } = useTranslation();

  return (
    <section className="event-location" id="lieu-dates">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">{t('eventLocation.badge')}</span>
          <h2 className="section-title">{t('eventLocation.title')}</h2>
        </div>

        <div className="event-location__content">
          {/* Texte */}
          <div className="event-location__text">
            <div className="event-location__meta">
              <div className="event-location__meta-item">
                <span className="event-location__icon">📅</span>
                <div>
                  <span className="event-location__meta-label">{t('eventLocation.datesLabel')}</span>
                  <span className="event-location__meta-value">16 — 19 {t('eventLocation.september')}</span>
                </div>
              </div>
              <div className="event-location__meta-item">
                <span className="event-location__icon">📍</span>
                <div>
                  <span className="event-location__meta-label">{t('eventLocation.placeLabel')}</span>
                  <span className="event-location__meta-value">Écoloh — La Sablette, Alger</span>
                </div>
              </div>
            </div>

            <p className="event-location__description">
              {t('eventLocation.description')}
            </p>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Ecoloh+La+Sablette+Alger"
              target="_blank"
              rel="noreferrer"
              className="event-location__map-link"
            >
              {t('eventLocation.mapLink')} →
            </a>
          </div>

          {/* Photo */}
          <div className="event-location__photo">
            <img src="/assets/ecoloh-sablette.png" alt="Parc Écoloh, La Sablette, Alger" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventLocationSection;