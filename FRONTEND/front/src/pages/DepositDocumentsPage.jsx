import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoredExposantId, uploadDocuments } from '../services/api';
import Button from '../components/common/Button';
import './DepositDocumentsPage.css';

const DOCS = [
  { key: 'documentTarification', label: 'Bon de commande / tarification signé' },
  { key: 'documentParticipation', label: 'Règlement intérieur / condition de participation signé' },
];

function DepositDocumentsPage() {
  const [files, setFiles] = useState({ documentTarification: null, documentParticipation: null });
  const [draggingKey, setDraggingKey] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadError, setUploadError] = useState(null);

  const validateAndSetFile = (key, selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      alert("Veuillez sélectionner un fichier PDF valide.");
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: selectedFile }));
    setUploadStatus('idle');
  };

  const handleDragOver = (key) => (e) => {
    e.preventDefault();
    setDraggingKey(key);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggingKey(null);
  };

  const handleDrop = (key) => (e) => {
    e.preventDefault();
    setDraggingKey(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(key, e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (key) => (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(key, e.target.files[0]);
    }
  };

  const removeFile = (key) => () => {
    setFiles((prev) => ({ ...prev, [key]: null }));
    setUploadStatus('idle');
  };

  const bothFilesReady = Boolean(files.documentTarification && files.documentParticipation);

  const handleUpload = async () => {
    if (!bothFilesReady) return;

    const exposantId = getStoredExposantId();
    if (!exposantId) {
      setUploadError('Session expirée. Veuillez recommencer depuis le bon de commande.');
      return;
    }

    setUploadStatus('uploading');
    setUploadError(null);
    try {
      await uploadDocuments(exposantId, files.documentTarification, files.documentParticipation);
      setUploadStatus('success');
      sessionStorage.removeItem('exposantId');
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Erreur lors de l\'envoi. Veuillez réessayer.');
      setUploadStatus('idle');
    }
  };

  return (
    <div className="deposit-page">
      <header className="deposit-header">
        <div className="container deposit-header__inner">
          <Link to="/" className="deposit-header__back">
            ← Retour à l'accueil
          </Link>
          <div className="deposit-header__logo">
            <span className="deposit-header__icon">🌍</span>
            <span className="deposit-header__name">KIDS WORLD FESTIVAL</span>
          </div>
        </div>
      </header>

      <main className="deposit-main container">
        <div className="deposit-content">
          {uploadStatus === 'success' ? (
            <div className="deposit-success">
              <div className="deposit-success__icon">✅</div>
              <h2>Dossier complet !</h2>
              <p>Vos deux documents signés et cachetés ont été déposés avec succès.</p>
              <p className="deposit-success__sub">
                Notre équipe va examiner votre dossier et vous contactera très prochainement.
              </p>
              <Link to="/">
                <Button variant="primary" size="lg">Retour à l'accueil</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="deposit-info">
                <h1>Dépôt de vos documents</h1>
                <p>
                  Veuillez déposer ici vos <strong>deux documents</strong> (bon de commande et règlement intérieur), signés et cachetés, au format PDF.
                </p>
              </div>

              {DOCS.map(({ key, label }) => {
                const file = files[key];
                return (
                  <div key={key} style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{label}</h3>
                    <div
                      className={`deposit-dropzone ${draggingKey === key ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                      onDragOver={handleDragOver(key)}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop(key)}
                    >
                      {!file ? (
                        <>
                          <div className="deposit-dropzone__icon">📄</div>
                          <h3>Glissez-déposez votre fichier PDF ici</h3>
                          <p>ou</p>
                          <label className="deposit-dropzone__btn">
                            Parcourir les fichiers
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handleFileInput(key)}
                              hidden
                            />
                          </label>
                          <span className="deposit-dropzone__hint">Format accepté : .pdf (Max. 5 MB)</span>
                        </>
                      ) : (
                        <div className="deposit-file-preview">
                          <div className="deposit-file-preview__icon">📑</div>
                          <div className="deposit-file-preview__info">
                            <span className="deposit-file-preview__name">{file.name}</span>
                            <span className="deposit-file-preview__size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <button
                            className="deposit-file-preview__remove"
                            onClick={removeFile(key)}
                            disabled={uploadStatus === 'uploading'}
                            title="Retirer ce fichier"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="deposit-actions">
                {uploadError && (
                  <div className="deposit-error">⚠️ {uploadError}</div>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!bothFilesReady || uploadStatus === 'uploading'}
                  onClick={handleUpload}
                  className={`deposit-btn ${uploadStatus === 'uploading' ? 'loading' : ''}`}
                >
                  {uploadStatus === 'uploading' ? (
                    <>
                      <span className="spinner"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    "Soumettre le dossier"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default DepositDocumentsPage;