import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientForm from './components/ClientForm';
import ClientSearch from './components/ClientSearch';
import ClientServices from './components/ClientServices';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem', background: '#e8e8e8' }}>
          <Link to="/" style={{ color: 'green', fontWeight: 'bold', textDecoration: 'none' }}>Register Client</Link>
          <Link to="/search" style={{ color: 'red', fontWeight: 'bold', textDecoration: 'none' }}>Search Clients</Link>
          <Link to="/services" style={{ color: '#2d7d46', fontWeight: 'bold', textDecoration: 'none' }}>Client Services</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ClientForm />} />
          <Route path="/search" element={<ClientSearch />} />
          <Route path="/services" element={<ClientServices />} />
          <Route path="/clients/:id" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
