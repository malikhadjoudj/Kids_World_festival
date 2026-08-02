import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PACKS, DROITS_INTERVENTION } from '../constants/packs';
import { createExposant, setStoredExposantId } from '../services/api';
import Button from '../components/common/Button';
import './OrderFormPage.css';

function OrderFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packId = searchParams.get('pack');
  
  const pack = useMemo(() => PACKS.find((p) => p.id === packId), [packId]);
  const [surface, setSurface] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    nomPrenom: '',
    fonction: '',
    raisonSociale: '',
    adresse: '',
    tel: '',
    contact: '',
    email: '',
    rc: '',
    nif: '',
    art: '',
    nis: '',
    activite: ''
  });

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    if (!pack) {
      navigate('/');
    }
  }, [pack, navigate]);

  if (!pack) return null;

  const validateField = (name, value) => {
    const trimmed = String(value || '').trim();

    if (!trimmed) {
      return 'Ce champ est obligatoire.';
    }

    switch (name) {
      case 'tel': {
        if (!/^\d+$/.test(trimmed)) {
          return 'Seuls les chiffres sont autorisés pour le téléphone.';
        }
        if (trimmed.length < 10) {
          return `Il manque ${10 - trimmed.length} chiffre(s).`;
        }
        if (trimmed.length > 10) {
          return 'Trop de chiffres : le téléphone doit contenir 10 chiffres.';
        }
        return '';
      }
      case 'email': {
        if (/\s/.test(trimmed)) {
          return 'L’adresse e-mail ne doit pas contenir d’espaces.';
        }
        if (!trimmed.includes('@')) {
          return 'Ajoutez le symbole @ et un domaine, par exemple nom@domaine.com.';
        }
        const [local, domain] = trimmed.split('@');
        if (!local || !domain || !domain.includes('.')) {
          return 'Le format attendu est nom@domaine.com.';
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? '' : 'Veuillez saisir une adresse e-mail valide.';
      }
      case 'rc': {
        if (trimmed.length < 16) {
          return `Il manque ${16 - trimmed.length} caractère(s).`;
        }
        if (trimmed.length > 16) {
          return 'Le RC doit contenir exactement 16 caractères.';
        }
        return '';
      }
      case 'nif': {
        if (!/^\d+$/.test(trimmed)) {
          return 'Seuls les chiffres sont autorisés pour le NIF.';
        }
        if (trimmed.length < 20) {
          return `Il manque ${20 - trimmed.length} chiffre(s).`;
        }
        if (trimmed.length > 20) {
          return 'Trop de chiffres : le NIF doit contenir 20 chiffres.';
        }
        return '';
      }
      case 'art': {
        if (!/^\d+$/.test(trimmed)) {
          return 'Seuls les chiffres sont autorisés pour l’ART.';
        }
        if (trimmed.length < 11) {
          return `Il manque ${11 - trimmed.length} chiffre(s).`;
        }
        if (trimmed.length > 11) {
          return 'Trop de chiffres : l’ART doit contenir 11 chiffres.';
        }
        return '';
      }
      case 'nis': {
        if (!/^\d+$/.test(trimmed)) {
          return 'Seuls les chiffres sont autorisés pour le NIS.';
        }
        if (trimmed.length < 15) {
          return `Il manque ${15 - trimmed.length} chiffre(s).`;
        }
        if (trimmed.length > 15) {
          return 'Trop de chiffres : le NIS doit contenir 15 chiffres.';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = value;

    setFormData(prev => ({ ...prev, [name]: nextValue }));

    const fieldError = validateField(name, nextValue);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));

    if (!fieldError) {
      setSubmitError(null);
    }
  };

  const handleSurfaceChange = (e) => {
    const value = e.target.value;
    setSurface(value);

    const surfaceError = pack.perSquareMeter && !String(value).trim()
      ? 'La surface est obligatoire pour cette formule.'
      : '';

    setValidationErrors(prev => ({
      ...prev,
      surface: surfaceError,
    }));

    if (!surfaceError) {
      setSubmitError(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) errors[key] = error;
    });

    if (pack.perSquareMeter && !surface) {
      errors.surface = 'La surface est obligatoire pour cette formule.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const hasVisibleErrors = Object.values(validationErrors).some(Boolean);

  const calculatePrices = () => {
    let packPrice = pack.price;
    if (pack.perSquareMeter) {
      const sqMeters = parseInt(surface) || 0;
      packPrice = packPrice * sqMeters;
    }
    
    const totaleHT = packPrice + DROITS_INTERVENTION;
    const tva = totaleHT * 0.19;
    const totaleTTC = totaleHT + tva;

    return { packPrice, totaleHT, tva, totaleTTC };
  };

  const prices = calculatePrices();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSubmitError('Veuillez corriger les champs en rouge avant de continuer.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const prices = calculatePrices();
      const exposant = await createExposant({
        ...formData,
        packId: packId,
        surface: surface ? parseInt(surface) : null,
        totalHT: prices.totaleHT,
        tva: prices.tva,
        totalTTC: prices.totaleTTC,
      });
      // Save the exposant id so next pages can use it for document upload
      setStoredExposantId(exposant.id);
      navigate(`/document-tarification?pack=${packId}&exposantId=${exposant.id}`);
    } catch (err) {
      console.error(err);
      if (err.details && typeof err.details === 'object') {
        setValidationErrors(prev => ({ ...prev, ...err.details }));
        setSubmitError('Veuillez corriger les champs en rouge avant de continuer.');
      } else {
        setSubmitError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="order-page">
      {/* Top Navbar Simple */}
      <header className="order-header">
        <div className="container order-header__inner">
          <Link to="/" className="order-header__back">
            ← Retour à l'accueil
          </Link>
          <div className="order-header__logo">
            <span className="order-header__icon">🌍</span>
            <span className="order-header__name">KIDS WORLD FESTIVAL</span>
          </div>
        </div>
      </header>

      <main className="order-main container">
        <div className="order-grid">
          
          {/* Left: Form */}
          <div className="order-form-container">
            <div className="order-form-header">
              <h1>BON DE COMMANDE</h1>
              <p>Ce document est un engagement officiel</p>
            </div>

            <form id="order-form" className="order-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group form-group--full">
                  <label>Je Soussigné(e) Nom et Prénom :</label>
                  <input
                    type="text"
                    name="nomPrenom"
                    value={formData.nomPrenom}
                    onChange={handleInputChange}
                    className={validationErrors.nomPrenom ? 'input-error' : ''}
                  />
                  {validationErrors.nomPrenom && <p className="field-error">{validationErrors.nomPrenom}</p>}
                </div>
                
                <div className="form-group">
                  <label>Fonction :</label>
                  <input
                    type="text"
                    name="fonction"
                    value={formData.fonction}
                    onChange={handleInputChange}
                    className={validationErrors.fonction ? 'input-error' : ''}
                  />
                  {validationErrors.fonction && <p className="field-error">{validationErrors.fonction}</p>}
                </div>

                <div className="form-group form-group--full">
                  <label>Raison Sociale :</label>
                  <input
                    type="text"
                    name="raisonSociale"
                    value={formData.raisonSociale}
                    onChange={handleInputChange}
                    className={validationErrors.raisonSociale ? 'input-error' : ''}
                  />
                  {validationErrors.raisonSociale && <p className="field-error">{validationErrors.raisonSociale}</p>}
                </div>

                <div className="form-group form-group--full">
                  <label>Adresse :</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className={validationErrors.adresse ? 'input-error' : ''}
                  />
                  {validationErrors.adresse && <p className="field-error">{validationErrors.adresse}</p>}
                </div>

                <div className="form-group">
                  <label>Tél :</label>
                  <input
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleInputChange}
                    className={validationErrors.tel ? 'input-error' : ''}
                  />
                  {validationErrors.tel && <p className="field-error">{validationErrors.tel}</p>}
                </div>

                <div className="form-group">
                  <label>Personne à Contacter :</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className={validationErrors.contact ? 'input-error' : ''}
                  />
                  {validationErrors.contact && <p className="field-error">{validationErrors.contact}</p>}
                </div>

                <div className="form-group form-group--full">
                  <label>Email :</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={validationErrors.email ? 'input-error' : ''}
                  />
                  {validationErrors.email && <p className="field-error">{validationErrors.email}</p>}
                </div>

                <div className="form-group">
                  <label>N° RC :</label>
                  <input
                    type="text"
                    name="rc"
                    value={formData.rc}
                    onChange={handleInputChange}
                    className={validationErrors.rc ? 'input-error' : ''}
                  />
                  {validationErrors.rc && <p className="field-error">{validationErrors.rc}</p>}
                </div>

                <div className="form-group">
                  <label>NIF :</label>
                  <input
                    type="text"
                    name="nif"
                    value={formData.nif}
                    onChange={handleInputChange}
                    className={validationErrors.nif ? 'input-error' : ''}
                  />
                  {validationErrors.nif && <p className="field-error">{validationErrors.nif}</p>}
                </div>

                <div className="form-group">
                  <label>ART :</label>
                  <input
                    type="text"
                    name="art"
                    value={formData.art}
                    onChange={handleInputChange}
                    className={validationErrors.art ? 'input-error' : ''}
                  />
                  {validationErrors.art && <p className="field-error">{validationErrors.art}</p>}
                </div>

                <div className="form-group">
                  <label>NIS :</label>
                  <input
                    type="text"
                    name="nis"
                    value={formData.nis}
                    onChange={handleInputChange}
                    className={validationErrors.nis ? 'input-error' : ''}
                  />
                  {validationErrors.nis && <p className="field-error">{validationErrors.nis}</p>}
                </div>

                <div className="form-group form-group--full">
                  <label>Activité Principale :</label>
                  <input
                    type="text"
                    name="activite"
                    value={formData.activite}
                    onChange={handleInputChange}
                    className={validationErrors.activite ? 'input-error' : ''}
                  />
                  {validationErrors.activite && <p className="field-error">{validationErrors.activite}</p>}
                </div>
              </div>
            </form>
          </div>

          {/* Right: Summary */}
          <div className="order-summary-container">
            <div className="order-summary">
              <h2 className="order-summary__title">Résumé de la sélection</h2>
              
              <div className="order-summary__pack">
                <span className="order-summary__pack-icon">{pack.icon}</span>
                <div>
                  <h3 className="order-summary__pack-name">{pack.name}</h3>
                  <p className="order-summary__pack-surface">{pack.surface}</p>
                </div>
              </div>

              {pack.perSquareMeter && (
                <div className="order-summary__surface-input form-group">
                  <label>Surface souhaitée (en m²) :</label>
                  <input 
                    type="number" 
                    min="9" 
                    placeholder="Ex: 15" 
                    value={surface} 
                    onChange={handleSurfaceChange}
                    className={validationErrors.surface ? 'input-error' : ''}
                    required 
                  />
                  {validationErrors.surface && <p className="field-error">{validationErrors.surface}</p>}
                </div>
              )}

              <div className="order-summary__prices">
                <div className="price-row">
                  <span>Formule sélectionnée</span>
                  <span>{prices.packPrice.toLocaleString('fr-DZ')} DA</span>
                </div>
                <div className="price-row price-row--highlight">
                  <span>Droits d'inscription obligatoires</span>
                  <span>{DROITS_INTERVENTION.toLocaleString('fr-DZ')} DA</span>
                </div>
                
                <div className="price-divider"></div>
                
                <div className="price-row price-row--ht">
                  <span>Total HT</span>
                  <span>{prices.totaleHT.toLocaleString('fr-DZ')} DA</span>
                </div>
                <div className="price-row price-row--tva">
                  <span>TVA 19%</span>
                  <span>{prices.tva.toLocaleString('fr-DZ')} DA</span>
                </div>
                <div className="price-row price-row--ttc">
                  <span>Total TTC</span>
                  <span>{prices.totaleTTC.toLocaleString('fr-DZ')} DA</span>
                </div>
              </div>

              <div className="order-summary__disclaimer">
                <p><strong>Note :</strong> Aucune annulation du bon de commande n'est acceptée.</p>
                <p>Déclare avoir pris connaissance et accepté les tarifs et les conditions de participation.</p>
              </div>

              {(submitError || hasVisibleErrors) && (
                <div className="order-summary__error">
                  ⚠️ {submitError || 'Veuillez corriger les champs indiqués avant de continuer.'}
                </div>
              )}

              <Button
                type="submit"
                form="order-form"
                variant="primary"
                size="lg"
                className="order-summary__btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Valider mon bon de commande →'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderFormPage;
