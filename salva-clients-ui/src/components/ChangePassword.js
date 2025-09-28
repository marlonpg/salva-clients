import React, { useState } from 'react';
import { apiRequest } from '../utils/api';
import './Inventory.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Nova senha e confirmação não coincidem');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/password/change', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        const message = await response.text();
        setSuccess(message);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (err) {
      setError('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventory">
      <h2>Alterar Senha</h2>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="password"
              placeholder="Senha atual *"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              placeholder="Nova senha *"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              required
              minLength="6"
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              placeholder="Confirmar nova senha *"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              minLength="6"
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: 'green', color: 'white' }}>
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>

        {error && <div className="error" style={{ marginTop: '1rem', color: 'red', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ marginTop: '1rem', color: 'green', textAlign: 'center', fontWeight: 'bold' }}>{success}</div>}
      </div>
    </div>
  );
};

export default ChangePassword;