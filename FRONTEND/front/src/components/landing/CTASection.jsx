import Button from '../common/Button';
import './CTASection.css';

function CTASection() {
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
          Prêt à embarquer pour le <span>KIDS WORLD FESTIVAL</span> ?
        </h2>
        <p className="cta-section__text">
          Réservez  dès maintenant et offrez à votre marque
          la visibilité qu'elle mérite lors du dernier grand événement avant la rentrée.
        </p>
        <div className="cta-section__actions">
          <Button variant="accent" size="lg" href="#formules" icon="🎪">
            Choisir une Formule
          </Button>
          <Button variant="outline" size="lg" href="#contact" icon="📧">
            Nous contacter
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
