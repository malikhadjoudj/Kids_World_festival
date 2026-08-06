import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import './CTASection.css';

function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="cta-section">
      <div className="cta-section__bg" aria-hidden="true">
        <div className="cta-section__orb cta-section__orb--1"></div>
        <div className="cta-section__orb cta-section__orb--2"></div>
        <div className="cta-section__orb cta-section__orb--3"></div>
      </div>

      <div className="container cta-section__content">
        <span className="cta-section__emoji">✈️</span>
        <h2 className="cta-section__title">
          {t('cta.titleBefore')} <span>KIDS WORLD FESTIVAL</span> ?
        </h2>
        <p className="cta-section__text">
          {t('cta.text')}
        </p>
        <div className="cta-section__actions">
          <Button variant="accent" size="lg" href="#formules" icon="🎪">
            {t('cta.btnReserve')}
          </Button>
          <Button variant="outline" size="lg" href="#contact" icon="📧">
            {t('cta.btnContact')}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CTASection;