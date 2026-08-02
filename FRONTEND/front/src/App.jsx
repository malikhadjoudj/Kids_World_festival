import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import OrderFormPage from './pages/OrderFormPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import FloorPlanPage from './pages/admin/FloorPlanPage';
import DocumentTarificationPage from './pages/DocumentTarificationPage';
import DocumentParticipationPage from './pages/DocumentParticipationPage';
import PreviewDocumentsPage from './pages/PreviewDocumentsPage';
import DepositDocumentsPage from './pages/DepositDocumentsPage';

function App() {
  useEffect(() => {
    const applyAutocomplete = () => {
      document.querySelectorAll('input').forEach((input) => {
        if (!input.getAttribute('autocomplete')) {
          input.setAttribute('autocomplete', 'off');
        }
      });
    };

    applyAutocomplete();
    const observer = new MutationObserver(applyAutocomplete);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/commande" element={<OrderFormPage />} />
        <Route path="/document-tarification" element={<DocumentTarificationPage />} />
        <Route path="/document-participation" element={<DocumentParticipationPage />} />
        <Route path="/telecharger-documents" element={<PreviewDocumentsPage />} />
        <Route path="/depot-documents" element={<DepositDocumentsPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/plan" element={<FloorPlanPage />} />
      </Routes>
    </div>
  );
}

export default App;
