import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      const res = await fetch(`http://localhost:8080/api/clients/${id}`);
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
      const res = await fetch('http://localhost:8080/api/services');
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
      const res = await fetch(`http://localhost:8080/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  if (!client) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      {editMode ? (
        <form className="edit-form" onSubmit={handleEditSubmit}>
          <input name="name" value={editForm.name} onChange={handleEditChange} required />
          <input name="lastname" value={editForm.lastname} onChange={handleEditChange} required />
          <input name="cpf" value={editForm.cpf} onChange={handleEditChange} required />
          <input name="address" value={editForm.address} onChange={handleEditChange} required />
          <input name="city" value={editForm.city} onChange={handleEditChange} required />
          <input name="emailAddress" value={editForm.emailAddress} onChange={handleEditChange} required />
          <input name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} required />
          <button type="submit" style={{ background: 'green', color: 'white' }}>Save</button>
          <button type="button" onClick={() => setEditMode(false)} style={{ marginLeft: '1rem' }}>Cancel</button>
        </form>
      ) : (
        <div className="client-info">
          <div><b>Name:</b> {client.name}</div>
          <div><b>Lastname:</b> {client.lastname}</div>
          <div><b>CPF:</b> {client.cpf}</div>
          <div><b>Address:</b> {client.address}</div>
          <div><b>City:</b> {client.city}</div>
          <div><b>Email:</b> {client.emailAddress}</div>
          <div><b>Phone:</b> {client.phoneNumber}</div>
          <button onClick={() => setEditMode(true)} style={{ marginTop: '1rem', background: 'orange', color: 'white' }}>Edit Info</button>
          <button onClick={() => navigate(-1)} style={{ marginLeft: '1rem' }}>Back</button>
        </div>
      )}
      <h3 style={{ marginTop: '2rem' }}>Services</h3>
      <table className="service-table">
        <thead>
          <tr>
            <th>Pet</th>
            <th>Severity</th>
            <th>Amount</th>
            <th>Created</th>
            <th>Updated</th>
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
