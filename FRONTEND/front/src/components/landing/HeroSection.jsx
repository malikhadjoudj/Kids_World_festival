import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import { EVENT_INFO } from '../../constants/packs';
import './HeroSection.css';

const STATS = [
  { value: '3', label: 'Offre Sponsor' },
  { value: '20 000+', label: 'Visiteurs prévus' },
  { value: '4', label: 'Formules disponibles' },
];

function HeroSection() {
  const { t } = useTranslation();
  const particlesRef = useRef(null);

  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle system — stars + paper planes
    const particles = [];
    const PARTICLE_COUNT = 60;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3 - 0.15,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        isStar: Math.random() > 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.phase += p.twinkleSpeed;

        const twinkle = Math.sin(p.phase) * 0.3 + 0.7;
        const alpha = p.opacity * twinkle;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        if (p.isStar) {
          // Draw star
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
            const method = j === 0 ? 'moveTo' : 'lineTo';
            ctx[method](
              Math.cos(angle) * p.size * 1.5,
              Math.sin(angle) * p.size * 1.5
            );
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 209, 102, ${alpha})`;
          ctx.fill();
          ctx.restore();
        } else {
          // Draw circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="hero" id="accueil">
      {/* Particles */}
      <canvas ref={particlesRef} className="hero__particles" aria-hidden="true" />

      {/* Decorative floating elements */}
      <div className="hero__floats" aria-hidden="true">
        <span className="hero__float hero__float--1">✈️</span>
        <span className="hero__float hero__float--2">🎈</span>
        <span className="hero__float hero__float--3">⭐</span>
        <span className="hero__float hero__float--4">🎪</span>
        <span className="hero__float hero__float--5">🌍</span>
        <span className="hero__float hero__float--6">🎒</span>
      </div>

      <div className="hero__content container">
        <div className="hero__text">
          <div className="hero__badge">
            <span className="hero__badge-dot"></span>
            {EVENT_INFO.type} — {t('footer.organizedBy')} {EVENT_INFO.organizer}
          </div>

          <h1 className="hero__title">
            <span className="hero__title-kids">KIDS</span>
            <span className="hero__title-world">WORLD</span>
            <span className="hero__title-festival">FESTIVAL</span>
          </h1>

          <p className="hero__tagline">{EVENT_INFO.tagline}</p>

         <p className="hero__description">
            {t('hero.description')}
          </p>

          <div className="hero__actions">
            <Button variant="primary" size="lg" href="#formules" icon="🚀">
              {t('hero.ctaPrimary')}
            </Button>
            <Button variant="outline" size="lg" href="#etapes" icon="📋">
              {t('hero.ctaSecondary')}
            </Button>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            {STATS.map((stat, i) => (
              <div className="hero__stat" key={i}>
                <span className="hero__stat-value">{stat.value}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="hero__wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,80 C240,120 480,40 720,80 C960,120 1200,40 1440,80 L1440,120 L0,120 Z"
            fill="var(--color-bg-light)"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
