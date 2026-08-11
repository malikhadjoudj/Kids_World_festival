import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  fetchExposantById,
  fetchExposants,
  getStoredPackSelection,
  setStoredExposantId,
} from '../services/api';
import { DROITS_INTERVENTION, getPackLineItems, getSelectedPacks, normalizePackIds, parseSurfaces } from '../constants/packs';
import Button from '../components/common/Button';
import './PreviewDocumentsPage.css';

const formatDa = (amount) => Number(amount || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 });

function PreviewDocumentsPage() {
  const navigate = useNavigate();
  const [exposant, setExposant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingDoc, setDownloadingDoc] = useState(null);
  const doc1Ref = useRef(null);
  const doc2Ref = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const exposantId = sessionStorage.getItem('exposantId') || localStorage.getItem('exposantId') || new URLSearchParams(window.location.search).get('exposantId');
      if (!exposantId) {
        setError("Aucune commande en cours trouvée. Veuillez retourner à l'accueil et remplir le bon de commande.");
        setLoading(false);
        return;
      }
      try {
        const data = await fetchExposantById(exposantId);
        setExposant(data);
      } catch (err) {
        try {
          const exposants = await fetchExposants();
          const latest = [...exposants].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
          if (latest?.id) {
            setStoredExposantId(latest.id);
            const fallback = await fetchExposantById(latest.id);
            setExposant(fallback);
            return;
          }
        } catch (fallbackError) {
          console.error(fallbackError);
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSingle = async (ref, docKey, fileName) => {
    if (!ref?.current) return;
    setDownloadingDoc(docKey);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(fileName);
    } catch (err) {
      console.error(err);
      alert('Impossible de générer le PDF demandé.');
    } finally {
      setDownloadingDoc(null);
    }
  };

  if (loading) return <div className="preview-loading">Chargement des documents...</div>;
  if (error) return <div className="preview-error">{error}</div>;
  if (!exposant) return null;

  const selectedPackIds = normalizePackIds(
    getStoredPackSelection(exposant.id) ||
    exposant.selectedPackIds ||
    exposant.packIds ||
    exposant.packId
  );
  // Prefer the per-pack surfaces saved at submission time (handles combining
  // Discover & Fun / Sell & Win with different m² each). Older dossiers saved
  // before this existed only have the single `surface` field — fall back to
  // reapplying that one value to every pack that needs a surface, same as
  // it was calculated at the time.
  const savedPackSurfaces = parseSurfaces(exposant.packSurfaces);
  const invoiceSurfaces = Object.keys(savedPackSurfaces).length > 0
    ? savedPackSurfaces
    : Object.fromEntries(
        getSelectedPacks(selectedPackIds)
          .filter((pack) => pack.perSquareMeter || pack.requiresSurface || pack.surfaceTiers)
          .map((pack) => [pack.id, exposant.surface])
      );
  const invoiceLineItems = getPackLineItems(selectedPackIds, invoiceSurfaces);
  const tarificationData = {
    nomPrenom: exposant.documentTarificationNomPrenom || exposant.nomPrenom || '',
    fonction: exposant.documentTarificationFonction || exposant.fonction || '',
    raisonSociale: exposant.documentTarificationRaisonSociale || exposant.raisonSociale || '',
    adresse: exposant.documentTarificationAdresse || exposant.adresse || '',
    tel: exposant.documentTarificationTel || exposant.tel || '',
    contact: exposant.documentTarificationContact || exposant.contact || '',
    email: exposant.documentTarificationEmail || exposant.email || '',
    rc: exposant.documentTarificationRc || exposant.rc || '',
    nif: exposant.documentTarificationNif || exposant.nif || '',
    art: exposant.documentTarificationArt || exposant.art || '',
    nis: exposant.documentTarificationNis || exposant.nis || '',
    activite: exposant.documentTarificationActivite || exposant.activite || '',
  };
  const participationData = {
    nomPrenom: exposant.documentParticipationNomPrenom || exposant.nomPrenom || '',
    entreprise: exposant.documentParticipationEntreprise || exposant.raisonSociale || '',
  };

  return (
    <div className="preview-page-wrapper">
      {/* Navigation - Hidden during print */}
      <div className="preview-nav no-print">
        <div className="preview-nav__inner">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Retour
          </Button>
          <div className="preview-nav__actions">
            <Button variant="primary" onClick={() => handleDownloadSingle(doc1Ref, 'doc1', `Bon_de_commande_${exposant.raisonSociale || 'document'}.pdf`)} className="print-btn" disabled={downloadingDoc !== null}>
              {downloadingDoc === 'doc1' ? 'Téléchargement...' : '⬇️ PDF document 1'}
            </Button>
            <Button variant="primary" onClick={() => handleDownloadSingle(doc2Ref, 'doc2', `Conditions_participation_${exposant.raisonSociale || 'document'}.pdf`)} className="print-btn" disabled={downloadingDoc !== null}>
              {downloadingDoc === 'doc2' ? 'Téléchargement...' : '⬇️ PDF document 2'}
            </Button>
            <Button variant="primary" onClick={handlePrint} className="print-btn">
              🖨️ Imprimer / Sauvegarder en PDF
            </Button>
            <Link to="/depot-documents" className="btn btn--success">
              Passer au dépôt →
            </Link>
          </div>
        </div>
        <div className="preview-instructions">
          <p>⚠️ <strong>Important :</strong> Imprimez ces deux documents, signez-les, apposez votre cachet, puis scannez-les pour les déposer à l'étape suivante.</p>
        </div>
      </div>

      {/* Printable Area */}
      <div className="printable-area">
        
        {/* DOCUMENT 1: BON DE COMMANDE */}
        <div className="print-page print-page--order doc-a4" ref={doc1Ref}>
          <div className="doc-header">
            <div className="doc-header__logo-left">
              <div className="edition-badge"><div className="edition-badge__inner"><span className="edition-badge__edi">édi<strong>1</strong>tion</span><span className="edition-badge__bts">BACK TO<br/>SCHOOL</span><div className="edition-badge__pencil">✏️</div></div></div>
            </div>
            <div className="doc-header__logo-right">
              <div className="meleven-logo"><span className="meleven-logo__text">MELEV<span className="meleven-logo__accent">E</span>N</span><span className="meleven-logo__sub">— AGENCY —</span></div>
              <div className="company-info-header">
                <strong>MELEVEN AGENCY</strong>
                <p>Adresse : Gadiri 02 BT 57 GRP 68 SEC 2, LOT 04 PORTE N 04, Alger</p>
                <p>Tél : 0563 05 34 63 &nbsp;|&nbsp; E-mail : Meleven.agency@gmail.com</p>
                <p>RC : 16/00-5061256 A25 &nbsp;|&nbsp; NIF : 267161800029 13911600 &nbsp;|&nbsp; NIS : 2 967 1618 00029 29</p>
              </div>
            </div>
          </div>
          
          <div className="doc-title-section">
            <h1 className="doc-main-title">BON DE COMMANDE</h1>
            <p className="doc-subtitle">Ce document est un engagement officiel</p>
          </div>

          <div className="print-grid">
            <div className="print-col">
              <p><strong>Raison Sociale :</strong> {tarificationData.raisonSociale}</p>
              <p><strong>Adresse :</strong> {tarificationData.adresse}</p>
              <p><strong>Tél :</strong> {tarificationData.tel}</p>
              <p><strong>Contact :</strong> {tarificationData.contact}</p>
              <p><strong>Email :</strong> {tarificationData.email}</p>
            </div>
            <div className="print-col">
              <p><strong>N° RC :</strong> {tarificationData.rc}</p>
              <p><strong>NIF :</strong> {tarificationData.nif}</p>
              <p><strong>ART :</strong> {tarificationData.art}</p>
              <p><strong>NIS :</strong> {tarificationData.nis}</p>
              <p><strong>Activité :</strong> {tarificationData.activite}</p>
            </div>
          </div>

          <div className="invoice-table-container">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th className="col-ref">RÉF</th>
                  <th className="col-des">DÉSIGNATION</th>
                  <th className="col-qte">QTE</th>
                  <th className="col-pu">P.U HT</th>
                  <th className="col-mnt">MONTANT HT</th>
                </tr>
              </thead>
              <tbody>
                {invoiceLineItems.map((lineItem, index) => {
                  const pack = lineItem.pack;
                  return (
                  <tr key={pack.id}>
                  <td className="col-ref">{index + 1}</td>
                  <td className="col-des">
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {pack?.name} {invoiceSurfaces[pack.id] ? `(${invoiceSurfaces[pack.id]} m²)` : ''}
                    </div>
                  </td>
                  <td className="col-qte" style={{ verticalAlign: 'top' }}>{String(lineItem.quantity).padStart(2, '0')}</td>
                  <td className="col-pu" style={{ verticalAlign: 'top' }}>{formatDa(lineItem.unitPrice)}</td>
                  <td className="col-mnt" style={{ verticalAlign: 'top' }}>{formatDa(lineItem.amount)}</td>
                </tr>
                  );
                })}
                <tr>
                  <td className="col-ref">{invoiceLineItems.length + 1}</td>
                  <td className="col-des">Droits d'intervention</td>
                  <td className="col-qte">01</td>
                  <td className="col-pu">{formatDa(DROITS_INTERVENTION)}</td>
                  <td className="col-mnt">{formatDa(DROITS_INTERVENTION)}</td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-bottom">
              <div className="invoice-note">
                <strong>Note :</strong>
              </div>
              <div className="invoice-totals">
                <div className="invoice-total-row">
                  <span>TOTAL HT</span>
                  <span>{exposant.totalHT.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="invoice-total-row invoice-tva-row">
                  <span>TVA 19%</span>
                  <span>{exposant.tva.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="invoice-total-row invoice-ttc-row">
                  <span>TOTAL TTC</span>
                  <span>{exposant.totalTTC.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="print-signatures">
            <div className="sig-box">
              <p>Cachet et Signature </p>
              <div className="sig-space"></div>
            </div>
          </div>
          
          <div className="doc-footer">
            <p>Adresse : Gadiri 02 BT 57 GRP 68 SEC 2, LOT 04 PORTE N 04, Alger / Tél : 0563053463 / E-mail : Meleven.agency@gmail.com</p>
            <p>RC : 16/00-5061256 A25 / NIF : 267161800029 13911600 / NIS : 2 967 1618 00029 29</p>
          </div>
        </div>

        {/* DOCUMENT 2: CONDITIONS DE PARTICIPATION */}
        <div className="print-page doc-a4" ref={doc2Ref}>
          <div className="doc-header">
            <div className="doc-header__logo-left">
              <div className="edition-badge"><div className="edition-badge__inner"><span className="edition-badge__edi">édi<strong>1</strong>tion</span><span className="edition-badge__bts">BACK TO<br/>SCHOOL</span><div className="edition-badge__pencil">✏️</div></div></div>
            </div>
            <div className="doc-header__logo-right">
              <div className="meleven-logo"><span className="meleven-logo__text">MELEV<span className="meleven-logo__accent">E</span>N</span><span className="meleven-logo__sub">— AGENCY —</span></div>
            </div>
          </div>

          <div className="doc-title-section">
            <h1 className="doc-main-title">CONDITION DE PARTICIPATION</h1>
          </div>

          <div className="part-body">
            {/* Article 1 */}
            <div className="part-article">
              <h2 className="part-article__title">ARTICLE 1 : RÈGLEMENT INTÉRIEUR</h2>
              <ul className="part-article__list">
                <li>L'exposant est tenu de respecter le règlement intérieur de l'espace.</li>
                <li>Le règlement intérieur sera transmis et communiqué à l'exposant avant l'ouverture de l'événement ou lors de son installation.</li>
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
              <p className="part-article__note"><strong>Note : chaque exposant est responsable de son stand, de son matériel, de sa marchandise ainsi que de son personnel.</strong></p>
              <ul className="part-article__list">
                <li>Les emplacements sont attribués par l'organisateur pour garantir une harmonie globale du parcours des visiteurs.</li>
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
                <li>Les exposants disposent des 14, 15 septembre et le 15 septembre pour finaliser leurs installations.</li>
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
              <div className="part-engagement__fields" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p><strong>Je soussigné(e) Mr/Mme :</strong> {participationData.nomPrenom}</p>
                <p><strong>Représentant de l'entreprise :</strong> {participationData.entreprise}</p>
                <p className="part-engagement__declare">
                  Déclare avoir lu et approuvé les présentes conditions et m'engage à les respecter sans réserve.
                </p>
              </div>
              <div className="part-engagement__signature" style={{ marginTop: '2rem', textAlign: 'right' }}>
                <p><strong>Cachet et signature</strong></p>
                <div style={{ height: '80px' }}></div>
              </div>
            </div>
          </div>

          <div className="doc-footer">
            <p>Adresse : Gadiri 02 BT 57 GRP 68 SEC 2, LOT 04 PORTE N 04, Alger / Tél : 0563053463 / E-mail : Meleven.agency@gmail.com</p>
            <p>RC : 16/00-5061256 A25 / NIF : 2671618000291311600 / NIS : 2 967 1618 00029 29</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PreviewDocumentsPage;