import React, { useState } from 'react';
import { apiRequest } from '../utils/api';
import './ClientForm.css';

const initialState = {
  name: '',
  lastname: '',
  cpf: '',
  address: '',
  city: '',
  emailAddress: '',
  phoneNumber: ''
};

export default function ClientForm({ onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/clients', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save client');
      setForm(initialState);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <h2>Cadastrar Novo Cliente</h2>
      <div className="form-row">
        <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
        <input name="lastname" placeholder="Sobrenome" value={form.lastname} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} required />
        <input name="address" placeholder="Endereço" value={form.address} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <input name="city" placeholder="Cidade" value={form.city} onChange={handleChange} required />
        <input name="emailAddress" placeholder="Email" type="email" value={form.emailAddress} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <input name="phoneNumber" placeholder="Telefone" value={form.phoneNumber} onChange={handleChange} required />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading} style={{ background: 'green', color: 'white' }}>
        {loading ? 'Salvando...' : 'Salvar Cliente'}
      </button>
    </form>
  );
}
