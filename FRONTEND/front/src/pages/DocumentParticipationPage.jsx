import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PACKS } from '../constants/packs';
import { updateExposant, getStoredExposantId } from '../services/api';
import './DocumentTarificationPage.css';
import './DocumentParticipationPage.css';

function DocumentParticipationPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packId = searchParams.get('pack');
  const docRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const pack = useMemo(() => PACKS.find((p) => p.id === packId), [packId]);
  const [formData, setFormData] = useState({
    nomPrenom: '',
    entreprise: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!pack) {
      navigate('/');
    }
    
    // Check if step 1 was completed
    const exposantId = getStoredExposantId();
    if (!exposantId) {
      navigate('/');
    }
  }, [pack, navigate]);

  if (!pack) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.nomPrenom.trim() || !formData.entreprise.trim()) {
      setSaveMessage('Veuillez remplir votre nom et le nom de votre entreprise.');
      return;
    }

    const exposantId = getStoredExposantId();
    if (!exposantId) {
      setSaveMessage("Session expirée. Veuillez recommencer depuis l'étape 1.");
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateExposant(exposantId, {
        documentParticipationNomPrenom: formData.nomPrenom,
        documentParticipationEntreprise: formData.entreprise,
      });
      setSaveMessage('Conditions de participation enregistrées !');
      setTimeout(() => {
        navigate('/telecharger-documents');
      }, 500);
    } catch (err) {
      console.error(err);
      setSaveMessage(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="doc-page-wrapper">
      {/* Navigation */}
      <div className="doc-nav">
        <div className="doc-nav__inner">
          <Link to={`/document-tarification?pack=${packId}`} className="doc-nav__back">← Retour au Document 1</Link>
          <div className="doc-nav__actions">
            <button
              className={`doc-nav__btn-primary ${isSaving ? 'loading' : ''}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner" />
                  Enregistrement...
                </>
              ) : (
                '✅ Valider et voir l\'aperçu'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="doc-cta-bar">
        <p>{t('docSteps.step2Instruction')}</p>
        <button
          className={`doc-nav__btn-primary doc-cta-bar__btn ${isSaving ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Enregistrement...' : '✅ Valider maintenant'}
        </button>
      </div>

      {/* Document */}
      <div className="doc-outer">
        <div className="doc-a4 doc-a4--participation" ref={docRef}>

          {/* Header */}
          <div className="doc-header">
            <div className="doc-header__logo-left">
              <div className="edition-badge">
                <div className="edition-badge__inner">
                  <span className="edition-badge__edi">édi<strong>1</strong>tion</span>
                  <span className="edition-badge__bts">BACK TO<br/>SCHOOL</span>
                  <div className="edition-badge__pencil">✏️</div>
                </div>
              </div>
            </div>
            <div className="doc-header__logo-right">
              <div className="meleven-logo">
                <span className="meleven-logo__text">MELEV<span className="meleven-logo__accent">E</span>N</span>
                <span className="meleven-logo__sub">— AGENCY —</span>
              </div>
            </div>
            <div className="doc-header__dots">
              {[...Array(20)].map((_, i) => (
                <span key={i} className="dot" />
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="doc-title-section">
            <h1 className="doc-main-title">CONDITION DE PARTICIPATION</h1>
          </div>

          {saveMessage && (
            <div className={`doc-status ${saveMessage.includes('enregistrées') ? 'doc-status--success' : 'doc-status--error'}`}>
              {saveMessage}
            </div>
          )}

          {/* Articles */}
          <div className="part-body">

            {/* Article 1 */}
            <div className="part-article">
              <h2 className="part-article__title">ARTICLE 1 : RÈGLEMENT INTÉRIEUR</h2>
              <ul className="part-article__list">
                <li>L'exposant est tenu de respecter le règlement intérieur de l'espace</li>
                <li>Le règlement intérieur sera transmis et communiqué à l'exposant avant l'ouverture de l'événement ou lors de son installation</li>
              </ul>
            </div>

            {/* Article 2 */}
            <div className="part-article">
              <h2 className="part-article__title">ARTICLE 2 : ASSURANCE DU STAND ET DU MATÉRIEL EXPOSÉ</h2>
              <ul className="part-article__list">
                <li>L'organisateur assurera la sécurité générale du site durant toute la durée de l'événement, de l'installation au démontage.</li>
                <li>Un service de gardiennage sera mis en place afin d'assurer la surveillance globale de l'espace d'exposition.</li>
                <li>L'organisateur ne pourra être tenu responsable en cas de perte, vol ou dommage survenu au niveau des stands ou des biens appartenant aux exposants.</li>
              </ul>
              <p className="part-article__note">
                <strong>Note : chaque exposant est responsable de son stand, de son matériel, de sa marchandise ainsi que de son personnel.</strong>
              </p>
              <ul className="part-article__list">
                <li>Les emplacements sont attribués par l'organisateur pour garantir une harmonie globale du parcours des visiteurs</li>
                <li>Les structures, comptoirs, câbles et équipements doivent être parfaitement stables et sécurisés (aucun câble apparent au sol sans passe-câble ou protection).</li>
              </ul>
            </div>

            {/* Article 3 */}
            <div className="part-article">
              <h2 className="part-article__title">ARTICLE 3 : INSTALLATION ET DÉSINSTALLATION DES STANDS</h2>
              <p className="part-article__subhead">Stands aménagés :</p>
              <ul className="part-article__list">
                <li>Installation : le 15 septembre 2026 de 08h00 à 22h00.</li>
                <li>Les exposants doivent impérativement terminer leur installation avant 22h00.</li>
              </ul>
              <p className="part-article__subhead">Stands personnalisés (non aménagés) :</p>
              <ul className="part-article__list">
                <li>Accès au site : à partir du 13 septembre 2026.</li>
                <li>Les exposants disposent des 14, 15 septembre pour finaliser leurs installations.</li>
                <li>Toute installation est strictement interdite à partir du 16 septembre 2026 (jour d'ouverture du festival).</li>
              </ul>
              <p className="part-article__subhead part-article__subhead--bold">DÉSINSTALLATION :</p>
              <ul className="part-article__list">
                <li>La désinstallation débute le 20 septembre 2026 à partir de 08h00.</li>
                <li>Aucune désinstallation ne sera autorisée avant la clôture officielle du salon.</li>
              </ul>
            </div>

            {/* Article 4 */}
            <div className="part-article">
              <h2 className="part-article__title">ARTICLE 4 : CONDITIONS DE RÈGLEMENT</h2>
              <ul className="part-article__list">
                <li>Pour un espace avec chapiteaux, le paiement s'effectuera à 50 % après avoir reçu le bon de commande.</li>
                <li>Pour un espace nu, le paiement s'effectuera à 100 % après avoir reçu le bon de commande.</li>
                <li>Pour les packs sponsoring, le paiement s'effectuera à 100 % après avoir reçu le bon de commande.</li>
              </ul>
            </div>

            {/* Engagement */}
            <div className="part-engagement">
              <h3 className="part-engagement__title">ENGAGEMENT :</h3>
              <div className="part-engagement__fields">
                <div className="doc-field-row">
                  <label className="doc-field-label">Je soussigné(e) Mr/Mme :</label>
                  <input
                    className="doc-field-input"
                    type="text"
                    name="nomPrenom"
                    value={formData.nomPrenom}
                    onChange={handleChange}
                  />
                </div>
                <div className="doc-field-row">
                  <label className="doc-field-label">Représentant de l'entreprise :</label>
                  <input
                    className="doc-field-input"
                    type="text"
                    name="entreprise"
                    value={formData.entreprise}
                    onChange={handleChange}
                  />
                </div>
                <p className="part-engagement__declare">
                  Déclare avoir lu et approuvé les présentes conditions et m'engage à les respecter sans réserve.
                </p>
              </div>
              <div className="part-engagement__signature">
                <p>cachet et signature</p>
              </div>
            </div>

            {/* Dot decorations bottom-left */}
            <div className="part-dots-bl">
              {[...Array(16)].map((_, i) => (
                <span key={i} className="dot" />
              ))}
            </div>
            <div className="part-dots-br">
              {[...Array(16)].map((_, i) => (
                <span key={i} className="dot" />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="doc-footer">
            <p>Adresse : Gadiri 02 BT 57 GRP 68 SEC 2, LOT 04 PORTE N 04, Alger / Tél : 0563053463 / E-mail : Meleven.agency@gmail.com</p>
            <p>RC : 16/00-5061256 A25 / NIF : 2671618000291311600 / NIS : 2 967 1618 00029 29</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentParticipationPage;
