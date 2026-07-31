import { Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import OrderFormPage from './pages/OrderFormPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import FloorPlanPage from './pages/admin/FloorPlanPage';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/commande" element={<OrderFormPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/plan" element={<FloorPlanPage />} />
      </Routes>
    </div>
  );
}

export default App;
