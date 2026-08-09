import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './EventHighlights.css';

const HIGHLIGHT_ICONS = ['🎯', '🚀 ', '✨', '💼 '];
const COUNTER_TARGETS = [
  { target: 4, suffix: ' jours' },
  { target: 25000/j, suffix: '+' },
  { target: 3, suffix: '' },
  { target: 4, suffix: '' },
];

function AnimatedCounter({ target, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setCount(Math.floor(eased * target));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="highlights__counter" ref={ref}>
      <span className="highlights__counter-value">
        {count.toLocaleString('fr-FR')}{suffix}
      </span>
      <span className="highlights__counter-label">{label}</span>
    </div>
  );
}

function EventHighlights() {
  const { t } = useTranslation();
  const counterLabels = t('highlights.counterLabels', { returnObjects: true });
  const items = t('highlights.items', { returnObjects: true });

  const counters = COUNTER_TARGETS.map((c, i) => ({ ...c, label: counterLabels[i] }));

  return (
    <section className="highlights" id="avantages">
      {/* Counters */}
      <div className="highlights__counters-section">
        <div className="container">
          <div className="highlights__counters">
            {counters.map((c, i) => (
              <AnimatedCounter key={i} {...c} />
            ))}
          </div>
        </div>
      </div>

      {/* Advantages */}
      <div className="highlights__advantages">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('highlights.badge')}</span>
            <h2 className="section-title section-title--light">
              {t('highlights.title')}
            </h2>
            <p className="section-subtitle section-subtitle--light">
              {t('highlights.subtitle')}
            </p>
          </div>

          <div className="highlights__grid">
            {items.map((item, i) => (
              <div className="highlights__card" key={i}>
                <span className="highlights__card-icon">{HIGHLIGHT_ICONS[i]}</span>
                <h3 className="highlights__card-title">{item.title}</h3>
                <p className="highlights__card-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventHighlights;