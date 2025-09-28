import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import ClientForm from './components/ClientForm';
import ClientSearch from './components/ClientSearch';
import ClientServices from './components/ClientServices';
import UserProfile from './components/UserProfile';
import Inventory from './components/Inventory';
import CostManagement from './components/CostManagement';
import UserManagement from './components/UserManagement';
import ChangePassword from './components/ChangePassword';
import './App.css';

function AppContent() {
  const { user, logout, hasAnyRole } = useAuth();

  if (!user) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <div className="App">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#e8e8e8' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/" style={{ color: 'green', fontWeight: 'bold', textDecoration: 'none' }}>Clientes</Link>
          {hasAnyRole(['ADMIN', 'VETERINARIAN']) && (
            <Link to="/services" style={{ color: '#2d7d46', fontWeight: 'bold', textDecoration: 'none' }}>Serviços</Link>
          )}
          {hasAnyRole(['ADMIN', 'VETERINARIAN']) && (
            <Link to="/inventory" style={{ color: 'green', fontWeight: 'bold', textDecoration: 'none' }}>Estoque</Link>
          )}
          {hasAnyRole(['ADMIN']) && (
            <Link to="/costs" style={{ color: 'green', fontWeight: 'bold', textDecoration: 'none' }}>Gestão de Custos</Link>
          )}
          {hasAnyRole(['ADMIN']) && (
            <Link to="/users" style={{ color: 'green', fontWeight: 'bold', textDecoration: 'none' }}>Usuários</Link>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Olá, {user.fullName}</span>
          <Link to="/change-password" style={{ color: 'green', textDecoration: 'none' }}>Alterar Senha</Link>
          <button onClick={logout} style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<ClientSearch />} />
        {hasAnyRole(['ADMIN', 'VETERINARIAN']) && (
          <Route path="/services" element={<ClientServices />} />
        )}
        {hasAnyRole(['ADMIN', 'VETERINARIAN']) && (
          <Route path="/inventory" element={<Inventory />} />
        )}
        {hasAnyRole(['ADMIN']) && (
          <Route path="/costs" element={<CostManagement />} />
        )}
        {hasAnyRole(['ADMIN']) && (
          <Route path="/users" element={<UserManagement />} />
        )}
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/clients/:id" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
