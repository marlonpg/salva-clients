import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
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
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) throw new Error('Credenciais inválidas');
      
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login - Sistema Veterinário</h2>
        <input 
          name="username" 
          placeholder="Usuário" 
          value={form.username} 
          onChange={handleChange} 
          required 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Senha" 
          value={form.password} 
          onChange={handleChange} 
          required 
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="demo-users">
          <p><strong>Usuários de teste:</strong></p>
          <p>admin/password (Administrador)</p>
          <p>vet/password (Veterinário)</p>
          <p>recep/password (Recepcionista)</p>
        </div>
      </form>
    </div>
  );
}