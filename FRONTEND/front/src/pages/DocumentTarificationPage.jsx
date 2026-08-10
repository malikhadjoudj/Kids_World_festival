import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  calculateSelectionPrices,
  getPackLineItems,
  getPrimaryPackId,
  getSelectedPacks,
  normalizePackIds,
  parseSurfaces,
} from '../constants/packs';
import { createExposant, setStoredExposantId, setStoredPackSelection } from '../services/api';
import './DocumentTarificationPage.css';

function DocumentTarificationPage() {
   const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packId = searchParams.get('pack');
  const docRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [lastPackParam, setLastPackParam] = useState(packId);
  const [selectedPackIds, setSelectedPackIds] = useState(() => normalizePackIds(packId));
  // Surfaces for Discover & Fun / Sell & Win are chosen upfront on the landing
  // page and travel here read-only via the "surfaces" URL param.
  const tierSurfaces = useMemo(() => parseSurfaces(searchParams.get('surfaces')), [searchParams]);
  // Manual surface entry, still filled in on this page, for packs like
  // Espace Nu / Pack Algérie which don't have preset tiers.
  const [surface, setSurface] = useState('');
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
    activite: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const selected = normalizePackIds(packId);
    if (selected.length === 0) {
      navigate('/');
      return;
    }
    // Safety net: a tier pack (Discover & Fun / Sell & Win) must already
    // carry a valid 12/24 m² surface from the landing page. If it doesn't
    // (e.g. a hand-edited URL), send the person back to choose it there.
    const packs = getSelectedPacks(selected);
    const hasInvalidTierPack = packs.some((selectedPack) => {
      if (!selectedPack.surfaceTiers) return false;
      const chosen = tierSurfaces[selectedPack.id];
      return !selectedPack.surfaceTiers.some((tier) => tier.surface === chosen);
    });
    if (hasInvalidTierPack) {
      navigate('/');
    }
  }, [packId, tierSurfaces, navigate]);

  if (packId !== lastPackParam) {
    setLastPackParam(packId);
    setSelectedPackIds(normalizePackIds(packId));
  }

  if (selectedPackIds.length === 0) return null;

  const selectedPacks = getSelectedPacks(selectedPackIds);
  const manualSurfacePacks = selectedPacks.filter((selectedPack) => selectedPack.perSquareMeter || selectedPack.requiresSurface);
  const surfaces = {
    ...tierSurfaces,
    ...Object.fromEntries(manualSurfacePacks.map((selectedPack) => [selectedPack.id, surface])),
  };
  const lineItems = getPackLineItems(selectedPackIds, surfaces);
  const prices = calculateSelectionPrices(selectedPackIds, surfaces);
  const needsManualSurface = manualSurfacePacks.length > 0;

  const validateField = (name, value) => {
    const trimmed = String(value || '').trim();

    if (!trimmed) {
      return 'Ce champ est obligatoire.';
    }

    switch (name) {
      case 'tel': {
        if (!/^\d+$/.test(trimmed)) return 'Seuls les chiffres sont autorisés.';
        if (trimmed.length < 10) return `Il manque ${10 - trimmed.length} chiffre(s).`;
        if (trimmed.length > 10) return 'Le téléphone doit contenir 10 chiffres.';
        return '';
      }
      case 'email': {
        if (/\s/.test(trimmed)) return 'L’adresse e-mail ne doit pas contenir d’espaces.';
        if (!trimmed.includes('@')) return 'Ajoutez le symbole @ et un domaine, par exemple nom@domaine.com.';
        const [local, domain] = trimmed.split('@');
        if (!local || !domain || !domain.includes('.')) return 'Le format attendu est nom@domaine.com.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? '' : 'Veuillez saisir une adresse e-mail valide.';
      }
      case 'rc': {
        if (trimmed.length < 16) return `Il manque ${16 - trimmed.length} caractère(s).`;
        if (trimmed.length > 16) return 'Le RC doit contenir exactement 16 caractères.';
        return '';
      }
      case 'nif': {
        if (!/^\d+$/.test(trimmed)) return 'Seuls les chiffres sont autorisés.';
        if (trimmed.length < 20) return `Il manque ${20 - trimmed.length} chiffre(s).`;
        if (trimmed.length > 20) return 'Le NIF doit contenir 20 chiffres.';
        return '';
      }
      case 'art': {
        if (!/^\d+$/.test(trimmed)) return 'Seuls les chiffres sont autorisés.';
        if (trimmed.length < 11) return `Il manque ${11 - trimmed.length} chiffre(s).`;
        if (trimmed.length > 11) return 'L’ART doit contenir 11 chiffres.';
        return '';
      }
      case 'nis': {
        if (!/^\d+$/.test(trimmed)) return 'Seuls les chiffres sont autorisés.';
        if (trimmed.length < 15) return `Il manque ${15 - trimmed.length} chiffre(s).`;
        if (trimmed.length > 15) return 'Le NIS doit contenir 15 chiffres.';
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const fieldError = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleSave = async () => {
    const requiredFields = ['nomPrenom', 'fonction', 'raisonSociale', 'adresse', 'tel', 'contact', 'email', 'rc', 'nif', 'art', 'nis', 'activite'];
    const errors = {};

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSaveMessage('Veuillez corriger les champs indiqués avant de valider.');
      return;
    }

    if (selectedPackIds.length === 0) {
      setSaveMessage('Veuillez choisir au moins un pack.');
      return;
    }

    if (needsManualSurface && (!surface || Number.parseInt(surface, 10) < 9)) {
      setValidationErrors((prev) => ({ ...prev, surface: 'Surface invalide (9 m² minimum).' }));
      setSaveMessage('Veuillez indiquer une surface valide de 9 m2 minimum.');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const primaryPackId = getPrimaryPackId(selectedPackIds);
      const primarySurfaceValue = surfaces[primaryPackId];
      const exposant = await createExposant({
        ...formData,
        packId: primaryPackId,
        selectedPackIds: selectedPackIds.join(','),
        packIds: selectedPackIds,
        surface: primarySurfaceValue ? Number.parseInt(primarySurfaceValue, 10) : null,
        totalHT: prices.totaleHT,
        tva: prices.tva,
        totalTTC: prices.totaleTTC,
      });
      setStoredExposantId(exposant.id);
      setStoredPackSelection(exposant.id, selectedPackIds);
      setSaveMessage('Bon de commande enregistré avec succès !');
      // Navigate to document 2
      setTimeout(() => {
        navigate(`/document-participation?pack=${primaryPackId}`);
      }, 500);
    } catch (err) {
      console.error(err);
      setSaveMessage(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

 const getPackLabel = (selectedPack) => {
    const packSurface = surfaces[selectedPack.id];
    const tierPrice = selectedPack.surfaceTiers
      ? (Number(packSurface) === 24 ? '380 000,00 DA' : '220 000,00 DA')
      : null;
    const tierSurfaceLabel = selectedPack.surfaceTiers
      ? (packSurface ? `Surface sélectionnée : ${packSurface} m²` : 'Surface au choix : 12 m² ou 24 m²')
      : null;

    switch (selectedPack.id) {
      case 'discover-fun':
        return { title: 'PACK DISCOVER & FUN', price: tierPrice, desc: 'Exposition et animation — Incluant : la surface + raccordement électrique + 1 table + 3 chaises', surface: tierSurfaceLabel };
      case 'sell-win':
        return { title: 'PACK SELL & WIN', price: tierPrice, desc: 'Vente — Incluant : la surface + raccordement électrique + 1 table + 3 chaises', surface: tierSurfaceLabel };
      case 'pack-italie':
        return { title: 'PACK SPONSOR ITALIE', price: '1 200 000,00 DA HT', desc: 'Logo sur photocall, espace activation 60 m², spot publicitaire et animation sur scène.', surface: 'Visibilité premium pour votre marque' };
      case 'pack-turquie':
        return { title: 'PACK SPONSOR TURQUIE', price: '2 200 000,00 DA HT', desc: 'Grand format publicitaire, Pop-Up d’accueil, scène principale et deux créneaux d’animation.', surface: 'Espace d’exposition 150 m² + chapiteau 25 m²' };
      case 'pack-algerie':
        return { title: 'PACK SPONSOR ALGÉRIE', price: '4 000 000,00 DA HT', desc: 'Branding exclusif, Pop-Up d’entrée, habillage des allées et présence sur la communication officielle.', surface: 'Activation premium' };
      case 'espace-nu':
        return { title: 'OPTION', price: '', desc: 'Espace nu : 12 000 DA/m²', surface: '' };
      default:
        return null;
    }
  };

  const getLineItemLabel = (lineItem) => {
    const packLabel = getPackLabel(lineItem.pack) || {
      title: lineItem.pack.name,
      price: lineItem.pack.priceLabel,
      desc: '',
      surface: lineItem.pack.surface || '',
    };

    return {
      ...packLabel,
      price: lineItem.unitPrice.toLocaleString('fr-DZ', { minimumFractionDigits: 2 }) + ' DA',
    };
  };

  return (
    <div className="doc-page-wrapper">
      {/* Navigation Bar */}
      <div className="doc-nav">
        <div className="doc-nav__inner">
          <Link to="/" className="doc-nav__back">← Retour à l'accueil</Link>
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
                '✅ Valider et passer au document 2'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="doc-cta-bar">
        <p>{t('docSteps.step1Instruction')}</p>
        <button
          className={`doc-nav__btn-primary doc-cta-bar__btn ${isSaving ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Enregistrement...' : '✅ Valider maintenant'}
        </button>
      </div>

      {/* Official Document */}
      <div className="doc-outer">
        <div className="doc-a4" ref={docRef}>
          {/* Header */}
          <div className="doc-header">
            <div className="doc-header__logo-left">
              <div className="edition-badge"><div className="edition-badge__inner"><span className="edition-badge__edi">édi<strong>1</strong>tion</span><span className="edition-badge__bts">BACK TO<br/>SCHOOL</span><div className="edition-badge__pencil">✏️</div></div></div>
            </div>
            <div className="doc-header__logo-right">
              <div className="meleven-logo"><span className="meleven-logo__text">MELEV<span className="meleven-logo__accent">E</span>N</span><span className="meleven-logo__sub">— AGENCY —</span></div>
            </div>
            <div className="doc-header__dots">
              {[...Array(20)].map((_, i) => (
                <span key={i} className="dot" />
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="doc-title-section">
            <h1 className="doc-main-title">SURFACE ET TARIFICATION – ESPACE D'EXPOSITION</h1>
            <p className="doc-subtitle">Droits d'intervention Obligatoire : 15 000,00 DA</p>
          </div>

          {/* Engagement */}
          <div className="doc-engagement">
            <p className="doc-engagement__text">Ce document est un engagement officiel</p>
          </div>

          {saveMessage && (
            <div className={`doc-status ${saveMessage.includes('succès') ? 'doc-status--success' : 'doc-status--error'}`}>
              {saveMessage}
            </div>
          )}

          {/* Form Fields */}
          <div className="doc-form-fields">
            <div className="doc-field-row">
              <label className="doc-field-label">Je soussigné(e) Nom et Prénom :</label>
              <input className={`doc-field-input ${validationErrors.nomPrenom ? 'doc-field-input--error' : ''}`} type="text" name="nomPrenom" value={formData.nomPrenom} onChange={handleChange} />
              {validationErrors.nomPrenom && <p className="doc-field-error">{validationErrors.nomPrenom}</p>}
            </div>
            <div className="doc-field-row">
              <label className="doc-field-label">Fonction :</label>
              <input className={`doc-field-input ${validationErrors.fonction ? 'doc-field-input--error' : ''}`} type="text" name="fonction" value={formData.fonction} onChange={handleChange} />
              {validationErrors.fonction && <p className="doc-field-error">{validationErrors.fonction}</p>}
            </div>
            <div className="doc-field-row">
              <label className="doc-field-label">Raison Sociale :</label>
              <input className={`doc-field-input ${validationErrors.raisonSociale ? 'doc-field-input--error' : ''}`} type="text" name="raisonSociale" value={formData.raisonSociale} onChange={handleChange} />
              {validationErrors.raisonSociale && <p className="doc-field-error">{validationErrors.raisonSociale}</p>}
            </div>
            <div className="doc-field-row">
              <label className="doc-field-label">Adresse :</label>
              <input className={`doc-field-input ${validationErrors.adresse ? 'doc-field-input--error' : ''}`} type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
              {validationErrors.adresse && <p className="doc-field-error">{validationErrors.adresse}</p>}
            </div>
            <div className="doc-field-row">
              <label className="doc-field-label">Tél :</label>
              <input className={`doc-field-input ${validationErrors.tel ? 'doc-field-input--error' : ''}`} type="tel" name="tel" value={formData.tel} onChange={handleChange} />
              {validationErrors.tel && <p className="doc-field-error">{validationErrors.tel}</p>}
            </div>
            <div className="doc-field-row">
              <label className="doc-field-label">Personne à Contacter :</label>
              <input className={`doc-field-input ${validationErrors.contact ? 'doc-field-input--error' : ''}`} type="text" name="contact" value={formData.contact} onChange={handleChange} />
              {validationErrors.contact && <p className="doc-field-error">{validationErrors.contact}</p>}
            </div>
            <div className="doc-field-row">
              <label className="doc-field-label">Email :</label>
              <input className={`doc-field-input ${validationErrors.email ? 'doc-field-input--error' : ''}`} type="email" name="email" value={formData.email} onChange={handleChange} />
              {validationErrors.email && <p className="doc-field-error">{validationErrors.email}</p>}
            </div>
            <div className="doc-field-row doc-field-row--inline">
              <div className="doc-field-inline">
                <label className="doc-field-label">N°RC :</label>
                <input className={`doc-field-input ${validationErrors.rc ? 'doc-field-input--error' : ''}`} type="text" name="rc" value={formData.rc} onChange={handleChange} />
                {validationErrors.rc && <p className="doc-field-error">{validationErrors.rc}</p>}
              </div>
              <div className="doc-field-inline">
                <label className="doc-field-label">NIF :</label>
                <input className={`doc-field-input ${validationErrors.nif ? 'doc-field-input--error' : ''}`} type="text" name="nif" value={formData.nif} onChange={handleChange} />
                {validationErrors.nif && <p className="doc-field-error">{validationErrors.nif}</p>}
              </div>
              <div className="doc-field-inline">
                <label className="doc-field-label">ART :</label>
                <input className={`doc-field-input ${validationErrors.art ? 'doc-field-input--error' : ''}`} type="text" name="art" value={formData.art} onChange={handleChange} />
                {validationErrors.art && <p className="doc-field-error">{validationErrors.art}</p>}
              </div>
            </div>
            <div className="doc-field-row">
              <label className="doc-field-label">NIS :</label>
              <input className={`doc-field-input ${validationErrors.nis ? 'doc-field-input--error' : ''}`} type="text" name="nis" value={formData.nis} onChange={handleChange} />
              {validationErrors.nis && <p className="doc-field-error">{validationErrors.nis}</p>}
            </div>
            <div className="doc-field-row">
              <label className="doc-field-label">Activité Principale :</label>
              <input className={`doc-field-input ${validationErrors.activite ? 'doc-field-input--error' : ''}`} type="text" name="activite" value={formData.activite} onChange={handleChange} />
              {validationErrors.activite && <p className="doc-field-error">{validationErrors.activite}</p>}
            </div>
          </div>

          {/* Selected Packs */}
          <div className="doc-packs-section">
            {lineItems.map((lineItem) => {
              const packLabel = getLineItemLabel(lineItem);
              if (!packLabel) return null;

              return (
                <div
                  key={lineItem.pack.id}
                  className={`doc-pack-row ${lineItem.pack.id === 'espace-nu' ? 'doc-pack-row--option' : ''}`}
                >
                  <div className="doc-pack-label">
                    <span className="doc-pack-label__title">{packLabel.title}</span>
                    {packLabel.price && (
                      <span className="doc-pack-label__price">{packLabel.price}</span>
                    )}
                  </div>
                  <div className="doc-pack-desc">
                    <span>{packLabel.desc}</span>
                    {packLabel.surface && (
                      <strong className="doc-pack-desc__surface">{packLabel.surface}</strong>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {needsManualSurface && (
            <div className="doc-field-row" style={{ marginTop: '1rem' }}>
              <label className="doc-field-label">Surface souhaitée (m²) :</label>
              <input
                className={`doc-field-input ${validationErrors.surface ? 'doc-field-input--error' : ''}`}
                type="number"
                min="9"
                step="1"
                value={surface}
                onChange={(e) => {
                  setSurface(e.target.value);
                  setValidationErrors((prev) => ({ ...prev, surface: '' }));
                  setSaveMessage('');
                }}
                placeholder="Minimum 9 m²"
              />
              {validationErrors.surface && <p className="doc-field-error">{validationErrors.surface}</p>}
            </div>
          )}

          {/* Footer */}
          <div className="doc-footer">
            <p>Adresse : Gadiri 02 BT 57 GRP 68 SEC 2, LOT 04 PORTE N 04, Alger / Tél : 0563053463 / E-mail : Meleven.agency@gmail.com</p>
            <p>RC : 16/00-5061256 A25 / NIF : 267161800029 13911600 /NIS : 2 967 1618 00029 29</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentTarificationPage;