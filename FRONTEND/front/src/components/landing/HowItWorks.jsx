import { useTranslation } from 'react-i18next';
import './HowItWorks.css';

const STEP_ICONS = ['📝', '📦', '📝', '✍️'];
const STEP_NUMBERS = ['01', '02', '03', '04'];

function HowItWorks() {
  const { t } = useTranslation();
  const steps = t('howItWorks.steps', { returnObjects: true });

  return (
    <section className="how-it-works" id="etapes">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">{t('howItWorks.badge')}</span>
          <h2 className="section-title">{t('howItWorks.title')}</h2>
          <p className="section-subtitle">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="how-it-works__timeline">
          {steps.map((step, i) => (
            <div className="how-it-works__step" key={i}>
              <div className="how-it-works__step-icon-wrap">
                <div className="how-it-works__step-icon">{STEP_ICONS[i]}</div>
                <span className="how-it-works__step-number">{STEP_NUMBERS[i]}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="how-it-works__connector" aria-hidden="true"></div>
              )}
              <h3 className="how-it-works__step-title">{step.title}</h3>
              <p className="how-it-works__step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;