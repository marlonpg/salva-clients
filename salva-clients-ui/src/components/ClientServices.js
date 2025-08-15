import React, { useState, useEffect } from 'react';
import './ClientServices.css';

const initialState = {
  pet: '',
  clientId: '',
  severity: '',
};

export default function ClientServices() {
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchClients();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/services');
      setServices(await res.json());
    } catch (err) {
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/clients');
      setClients(await res.json());
    } catch (err) {
      setError('Failed to fetch clients');
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        pet: form.pet,
        severity: form.severity,
        client: { id: form.clientId }
      };
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:8080/api/services/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:8080/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) throw new Error('Failed to save service');
      setForm(initialState);
      setEditingId(null);
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = service => {
    setForm({
      pet: service.pet,
      clientId: service.client.id,
      severity: service.severity,
    });
    setEditingId(service.id);
  };

  const handleDelete = async id => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8080/api/services/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete service');
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-services">
      <h2>Client Services</h2>
      <form className="service-form" onSubmit={handleSubmit}>
        <input name="pet" placeholder="Pet" value={form.pet} onChange={handleChange} required />
        <select name="clientId" value={form.clientId} onChange={handleChange} required>
          <option value="">Select Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name} {client.lastname}</option>
          ))}
        </select>
        <input name="severity" placeholder="Severity" value={form.severity} onChange={handleChange} required />
        <button type="submit" disabled={loading} style={{ background: editingId ? 'orange' : 'green', color: 'white' }}>
          {editingId ? 'Update Service' : 'Add Service'}
        </button>
        {editingId && <button type="button" onClick={() => { setForm(initialState); setEditingId(null); }} style={{ marginLeft: '1rem' }}>Cancel</button>}
      </form>
      {error && <div className="error">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table className="service-table">
          <thead>
            <tr>
              <th>Pet</th>
              <th>Client</th>
              <th>Severity</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td>{service.pet}</td>
                <td>{service.client ? `${service.client.name} ${service.client.lastname}` : ''}</td>
                <td>{service.severity}</td>
                <td>{service.createdDate ? service.createdDate.replace('T', ' ').slice(0, 19) : ''}</td>
                <td>{service.updatedDate ? service.updatedDate.replace('T', ' ').slice(0, 19) : ''}</td>
                <td>
                  <button onClick={() => handleEdit(service)} style={{ marginRight: '0.5rem', background: 'orange', color: 'white' }}>Edit</button>
                  <button onClick={() => handleDelete(service.id)} style={{ background: 'red', color: 'white' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
