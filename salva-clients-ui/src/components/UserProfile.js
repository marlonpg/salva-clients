import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import './UserProfile.css';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [services, setServices] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchClient();
    fetchServices();
    // eslint-disable-next-line
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/clients/${id}`);
      const data = await res.json();
      setClient(data);
      setEditForm(data);
    } catch (err) {
      setError('Failed to fetch client');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/services');
      const allServices = await res.json();
      setServices(allServices.filter(s => s.client && String(s.client.id) === String(id)));
    } catch (err) {
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update client');
      setEditMode(false);
      fetchClient();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!client) return <div>Carregando...</div>;

  return (
    <div className="user-profile">
      <h2>Perfil do Cliente</h2>
      {editMode ? (
        <form className="edit-form" onSubmit={handleEditSubmit}>
          <input name="name" value={editForm.name} onChange={handleEditChange} required />
          <input name="lastname" value={editForm.lastname} onChange={handleEditChange} required />
          <input name="cpf" value={editForm.cpf} onChange={handleEditChange} required />
          <input name="address" value={editForm.address} onChange={handleEditChange} required />
          <input name="city" value={editForm.city} onChange={handleEditChange} required />
          <input name="emailAddress" value={editForm.emailAddress} onChange={handleEditChange} required />
          <input name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} required />
          <button type="submit" style={{ background: 'green', color: 'white' }}>Salvar</button>
          <button type="button" onClick={() => setEditMode(false)} style={{ marginLeft: '1rem' }}>Cancelar</button>
        </form>
      ) : (
        <div className="client-info">
          <div><b>Nome:</b> {client.name}</div>
          <div><b>Sobrenome:</b> {client.lastname}</div>
          <div><b>CPF:</b> {client.cpf}</div>
          <div><b>Endereço:</b> {client.address}</div>
          <div><b>Cidade:</b> {client.city}</div>
          <div><b>Email:</b> {client.emailAddress}</div>
          <div><b>Telefone:</b> {client.phoneNumber}</div>
          <button onClick={() => setEditMode(true)} style={{ marginTop: '1rem', background: 'orange', color: 'white' }}>Editar</button>
          <button onClick={() => navigate(-1)} style={{ marginLeft: '1rem' }}>Voltar</button>
        </div>
      )}
      <h3 style={{ marginTop: '2rem' }}>Serviços</h3>
      <table className="service-table">
        <thead>
          <tr>
            <th>Pet</th>
            <th>Gravidade</th>
            <th>Valor</th>
            <th>Criado</th>
            <th>Atualizado</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td>{service.pet}</td>
              <td>{service.severity}</td>
              <td>{service.amount != null ? Number(service.amount).toFixed(2) : ''}</td>
              <td>{service.createdDate ? service.createdDate.replace('T', ' ').slice(0, 19) : ''}</td>
              <td>{service.updatedDate ? service.updatedDate.replace('T', ' ').slice(0, 19) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
