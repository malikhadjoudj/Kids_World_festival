import './HowItWorks.css';

const STEPS = [
  {
    number: '01',
    icon: '📝',
    title: 'Remplissez le formulaire',
    description:
      'Renseignez les informations de votre entreprise : raison sociale, RC, NIF, coordonnées du gérant.',
  },
  {
    number: '02',
    icon: '📦',
    title: 'Choisissez votre formule',
    description:
      'Sélectionnez parmi nos 4 offres celle qui correspond le mieux à votre projet et votre budget.',
  },
  {
    number: '03',
    icon: '✍️',
    title: 'Signez votre contrat',
    description:
      'Téléchargez le bon de commande pré-rempli, signez-le et déposez-le sur la plateforme.',
  },
  {
    number: '04',
    icon: '📍',
    title: 'Recevez votre emplacement',
    description:
      "L'équipe MELEVEN vous attribue votre stand sur le plan de salle. Vous êtes prêt !",
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works" id="etapes">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">🔄 Simple & Rapide</span>
          <h2 className="section-title">Comment ça marche ?</h2>
          <p className="section-subtitle">
            En 4 étapes simples, réservez votre stand au KIDS WORLD FESTIVAL.
          </p>
        </div>

        <div className="how-it-works__timeline">
          {STEPS.map((step, i) => (
            <div className="how-it-works__step" key={i}>
              <div className="how-it-works__step-icon-wrap">
                <div className="how-it-works__step-icon">{step.icon}</div>
                <span className="how-it-works__step-number">{step.number}</span>
              </div>
              {i < STEPS.length - 1 && (
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
