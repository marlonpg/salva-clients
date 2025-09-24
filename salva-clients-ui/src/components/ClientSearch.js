import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import ClientForm from './ClientForm';
import './ClientSearch.css';

export default function ClientSearch() {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState({ name: '', cpf: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchClients = async () => {
    setLoading(true);
    const params = [];
    if (query.name) params.push(`name=${encodeURIComponent(query.name)}`);
    if (query.cpf) params.push(`cpf=${encodeURIComponent(query.cpf)}`);
    if (query.city) params.push(`city=${encodeURIComponent(query.city)}`);
    const endpoint = `/clients/search?${params.join('&')}`;
    const res = await apiRequest(endpoint);
    const data = await res.json();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line
  }, []);

  const handleChange = e => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchClients();
  };

  const handleClientAdded = () => {
    setShowForm(false);
    fetchClients();
  };

  return (
    <div className="client-search">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Clientes</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={{ background: 'green', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '6px', cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : 'Novo Cliente'}
        </button>
      </div>
      
      {showForm && (
        <div style={{ marginBottom: '2rem' }}>
          <ClientForm onSuccess={handleClientAdded} />
        </div>
      )}
      
      <form className="search-form" onSubmit={handleSearch}>
        <input name="name" placeholder="Nome" value={query.name} onChange={handleChange} />
        <input name="cpf" placeholder="CPF" value={query.cpf} onChange={handleChange} />
        <input name="city" placeholder="Cidade" value={query.city} onChange={handleChange} />
        <button type="submit" style={{ background: 'green', color: 'white' }}>Buscar</button>
      </form>
      {loading ? <div>Carregando...</div> : (
        <table className="client-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Sobrenome</th>
              <th>CPF</th>
              <th>Endereço</th>
              <th>Cidade</th>
              <th>Email</th>
              <th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/clients/${client.id}`)}>
                <td>{client.name}</td>
                <td>{client.lastname}</td>
                <td>{client.cpf}</td>
                <td>{client.address}</td>
                <td>{client.city}</td>
                <td>{client.emailAddress}</td>
                <td>{client.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
