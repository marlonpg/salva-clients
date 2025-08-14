import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientForm from './components/ClientForm';
import ClientSearch from './components/ClientSearch';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem', background: '#e8e8e8' }}>
          <Link to="/" style={{ color: 'green', fontWeight: 'bold', textDecoration: 'none' }}>Register Client</Link>
          <Link to="/search" style={{ color: 'red', fontWeight: 'bold', textDecoration: 'none' }}>Search Clients</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ClientForm />} />
          <Route path="/search" element={<ClientSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
