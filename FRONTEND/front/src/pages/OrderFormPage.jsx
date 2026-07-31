import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PACKS, DROITS_INTERVENTION } from '../constants/packs';
import Button from '../components/common/Button';
import './OrderFormPage.css';

function OrderFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packId = searchParams.get('pack');
  
  const [pack, setPack] = useState(null);
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
    activite: ''
  });

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    const selected = PACKS.find(p => p.id === packId);
    if (!selected) {
      navigate('/');
    } else {
      setPack(selected);
    }
  }, [packId, navigate]);

  if (!pack) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Soumission du dossier... (Cette fonctionnalité nécessitera le backend)");
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

            <form className="order-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group form-group--full">
                  <label>Je Soussigné(e) Nom et Prénom :</label>
                  <input type="text" name="nomPrenom" value={formData.nomPrenom} onChange={handleInputChange} required />
                </div>
                
                <div className="form-group">
                  <label>Fonction :</label>
                  <input type="text" name="fonction" value={formData.fonction} onChange={handleInputChange} required />
                </div>

                <div className="form-group form-group--full">
                  <label>Raison Sociale :</label>
                  <input type="text" name="raisonSociale" value={formData.raisonSociale} onChange={handleInputChange} required />
                </div>

                <div className="form-group form-group--full">
                  <label>Adresse :</label>
                  <input type="text" name="adresse" value={formData.adresse} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Tél :</label>
                  <input type="tel" name="tel" value={formData.tel} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Personne à Contacter :</label>
                  <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} required />
                </div>

                <div className="form-group form-group--full">
                  <label>Email :</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>N° RC :</label>
                  <input type="text" name="rc" value={formData.rc} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>NIF :</label>
                  <input type="text" name="nif" value={formData.nif} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>ART :</label>
                  <input type="text" name="art" value={formData.art} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>NIS :</label>
                  <input type="text" name="nis" value={formData.nis} onChange={handleInputChange} required />
                </div>

                <div className="form-group form-group--full">
                  <label>Activité Principale :</label>
                  <input type="text" name="activite" value={formData.activite} onChange={handleInputChange} required />
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
                    onChange={(e) => setSurface(e.target.value)} 
                    required 
                  />
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

              <Button variant="primary" size="lg" className="order-summary__btn" onClick={handleSubmit}>
                Générer et valider
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderFormPage;
