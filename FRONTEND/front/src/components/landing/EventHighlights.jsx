import { useEffect, useRef, useState } from 'react';
import './EventHighlights.css';

const HIGHLIGHTS = [
  {
    icon: '🎯',
    title: 'Visibilité maximale',
    description:
      'Exposez vos produits devant des milliers de familles et décideurs du secteur enfant.',
  },
  {
    icon: '🤝',
    title: 'Networking B2B',
    description:
      "Rencontrez d'autres marques, nouez des partenariats stratégiques et développez votre réseau.",
  },
  {
    icon: '🎨',
    title: 'Univers immersif',
    description:
      "Un salon pensé comme une aventure : le thème voyage crée une expérience mémorable pour vos visiteurs.",
  },
  {
    icon: '📊',
    title: 'Gestion simplifiée',
    description:
      'Inscription en ligne, suivi de dossier, attribution de stand — tout est centralisé sur notre plateforme.',
  },
];

const COUNTERS = [
  { target: 4, suffix: ' jours', label: "d'événement" },
  { target: 10000, suffix: '+', label: 'visiteurs attendus' },
  { target: 3, suffix: '', label: 'Pack Sponsor' },
  { target: 4, suffix: '', label: 'formules adaptées' },
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
  return (
    <section className="highlights" id="avantages">
      {/* Counters */}
      <div className="highlights__counters-section">
        <div className="container">
          <div className="highlights__counters">
            {COUNTERS.map((c, i) => (
              <AnimatedCounter key={i} {...c} />
            ))}
          </div>
        </div>
      </div>

      {/* Advantages */}
      <div className="highlights__advantages">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">✨ Avantages</span>
            <h2 className="section-title section-title--light">
              Pourquoi exposer au KIDS WORLD FESTIVAL ?
            </h2>
            <p className="section-subtitle section-subtitle--light">
              Un événement unique pour booster votre marque dans l'univers enfant.
            </p>
          </div>

          <div className="highlights__grid">
            {HIGHLIGHTS.map((item, i) => (
              <div className="highlights__card" key={i}>
                <span className="highlights__card-icon">{item.icon}</span>
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
