import { PACKS, DROITS_INTERVENTION } from '../../constants/packs';
import { STATUT_LABELS } from '../../data/mockExposants';
import './ExposantPreviewModal.css';

function ExposantPreviewModal({ exposant, onClose }) {
  if (!exposant) return null;

  const pack = PACKS.find((p) => p.id === exposant.packId);
  const statut = STATUT_LABELS[exposant.statutContrat];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="preview-modal__header">
          <h2>BON DE COMMANDE</h2>
          <p className="preview-modal__subtitle">Aperçu du dossier — {exposant.raisonSociale}</p>
          <span
            className="preview-modal__statut"
            style={{ color: statut.color, background: statut.bg }}
          >
            {statut.label}
          </span>
        </div>

        {/* Infos entreprise */}
        <div className="preview-modal__section">
          <h3>Informations de l'entreprise</h3>
          <div className="preview-modal__grid">
            <div className="preview-modal__field">
              <span className="preview-modal__label">Nom et Prénom</span>
              <span className="preview-modal__value">{exposant.nomPrenom}</span>
            </div>
            <div className="preview-modal__field">
              <span className="preview-modal__label">Fonction</span>
              <span className="preview-modal__value">{exposant.fonction}</span>
            </div>
            <div className="preview-modal__field preview-modal__field--full">
              <span className="preview-modal__label">Raison Sociale</span>
              <span className="preview-modal__value">{exposant.raisonSociale}</span>
            </div>
            <div className="preview-modal__field preview-modal__field--full">
              <span className="preview-modal__label">Adresse</span>
              <span className="preview-modal__value">{exposant.adresse}</span>
            </div>
            <div className="preview-modal__field">
              <span className="preview-modal__label">Téléphone</span>
              <span className="preview-modal__value">{exposant.tel}</span>
            </div>
            <div className="preview-modal__field">
              <span className="preview-modal__label">Email</span>
              <span className="preview-modal__value">{exposant.email}</span>
            </div>
            <div className="preview-modal__field">
              <span className="preview-modal__label">N° RC</span>
              <span className="preview-modal__value">{exposant.rc}</span>
            </div>
            <div className="preview-modal__field">
              <span className="preview-modal__label">NIF</span>
              <span className="preview-modal__value">{exposant.nif}</span>
            </div>
            <div className="preview-modal__field">
              <span className="preview-modal__label">ART</span>
              <span className="preview-modal__value">{exposant.art}</span>
            </div>
            <div className="preview-modal__field">
              <span className="preview-modal__label">NIS</span>
              <span className="preview-modal__value">{exposant.nis}</span>
            </div>
            <div className="preview-modal__field preview-modal__field--full">
              <span className="preview-modal__label">Activité Principale</span>
              <span className="preview-modal__value">{exposant.activite}</span>
            </div>
          </div>
        </div>

        {/* Pack & Tarification */}
        <div className="preview-modal__section preview-modal__section--dark">
          <h3>Surface et Tarification</h3>
          <div className="preview-modal__pack-badge">
            <span>{pack?.icon}</span>
            <strong>{pack?.name}</strong>
            {exposant.surface && <span className="preview-modal__surface">{exposant.surface} m²</span>}
          </div>

          <div className="preview-modal__prices">
            <div className="preview-modal__price-row">
              <span>Formule sélectionnée</span>
              <span>{pack?.perSquareMeter
                ? `${(exposant.surface * pack.price).toLocaleString('fr-DZ')} DA`
                : `${pack?.price.toLocaleString('fr-DZ')} DA`
              }</span>
            </div>
            <div className="preview-modal__price-row preview-modal__price-row--highlight">
              <span>Droits d'inscription obligatoires</span>
              <span>{DROITS_INTERVENTION.toLocaleString('fr-DZ')} DA</span>
            </div>
            <div className="preview-modal__price-divider"></div>
            <div className="preview-modal__price-row">
              <span>Total HT</span>
              <span><strong>{exposant.totalHT.toLocaleString('fr-DZ')} DA</strong></span>
            </div>
            <div className="preview-modal__price-row">
              <span>TVA 19%</span>
              <span>{exposant.tva.toLocaleString('fr-DZ')} DA</span>
            </div>
            <div className="preview-modal__price-row preview-modal__price-row--ttc">
              <span>Total TTC</span>
              <span>{exposant.totalTTC.toLocaleString('fr-DZ')} DA</span>
            </div>
          </div>
        </div>

        {/* Emplacement */}
        {exposant.standId && (
          <div className="preview-modal__section">
            <h3>Emplacement attribué</h3>
            <div className="preview-modal__stand-badge">
              📍 Stand {exposant.standId}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="preview-modal__note">
          <strong>Note :</strong> Aucune annulation du bon de commande n'est acceptée.
          Déclare avoir pris connaissance et accepté les tarifs et les conditions de participation.
        </div>
      </div>
    </div>
  );
}

export default ExposantPreviewModal;
