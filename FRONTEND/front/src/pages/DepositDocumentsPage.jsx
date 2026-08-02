import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoredExposantId, uploadDocument } from '../services/api';
import Button from '../components/common/Button';
import './DepositDocumentsPage.css';

function DepositDocumentsPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadError, setUploadError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // Only accept PDF
    if (selectedFile.type !== 'application/pdf') {
      alert("Veuillez sélectionner un fichier PDF valide.");
      return;
    }
    setFile(selectedFile);
    setUploadStatus('idle');
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const exposantId = getStoredExposantId();
    if (!exposantId) {
      setUploadError('Session expirée. Veuillez recommencer depuis le bon de commande.');
      return;
    }

    setUploadStatus('uploading');
    setUploadError(null);
    try {
      await uploadDocument(exposantId, file);
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
              <p>Vos documents signés et cachetés ont été déposés avec succès.</p>
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
                  Veuillez déposer ici votre bon de commande et le règlement intérieur <strong>signés et cachetés</strong> au format PDF.
                </p>
              </div>

              <div 
                className={`deposit-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
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
                        onChange={handleFileInput} 
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
                      onClick={removeFile}
                      disabled={uploadStatus === 'uploading'}
                      title="Retirer ce fichier"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="deposit-actions">
                {uploadError && (
                  <div className="deposit-error">⚠️ {uploadError}</div>
                )}
                <Button 
                  variant="primary" 
                  size="lg" 
                  disabled={!file || uploadStatus === 'uploading'}
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
