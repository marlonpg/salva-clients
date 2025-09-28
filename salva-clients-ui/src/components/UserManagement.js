import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import './Inventory.css';

const api = {
  get: (endpoint) => apiRequest(endpoint).then(res => res.json()),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(res => res.json()),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: ''
  });

  const roles = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'VETERINARIAN', label: 'Veterinário' },
    { value: 'RECEPTIONIST', label: 'Recepcionista' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users');
      setUsers(response);
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setFormData({
        username: '',
        fullName: '',
        email: '',
        role: ''
      });
      setEditingId(null);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError('Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleToggle = async (id) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/users/${id}/toggle`, {});
      loadUsers();
    } catch (err) {
      setError('Erro ao alterar status do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setLoading(true);
      setError('');
      try {
        await api.delete(`/users/${id}`);
        loadUsers();
      } catch (err) {
        setError('Erro ao excluir usuário');
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  return (
    <div className="inventory">
      <h2>Gerenciamento de Usuários</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: 'green' }}>Usuários do Sistema</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({
                username: '',
                fullName: '',
                email: '',
                role: ''
              });
            }
          }}
          style={{ background: 'green', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : 'Novo Usuário'}
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Nome de usuário *"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Nome completo *"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="">Selecione um perfil</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ background: editingId ? 'orange' : 'green', color: 'white' }}>
            {editingId ? 'Atualizar Usuário' : 'Criar Usuário'}
          </button>
          {editingId && (
            <button type="button" onClick={() => {
              setFormData({
                username: '',
                fullName: '',
                email: '',
                role: ''
              });
              setEditingId(null);
              setShowForm(false);
            }} style={{ marginLeft: '1rem' }}>
              Cancelar
            </button>
          )}
        </form>
      )}

      {error && <div className="error">{error}</div>}

      {loading ? <div>Carregando...</div> : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Nome Completo</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Senha Definida</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users?.length > 0 ? users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{getRoleLabel(user.role)}</td>
                <td>
                  <span style={{ color: user.enabled ? 'green' : 'red', fontWeight: 'bold' }}>
                    {user.enabled ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <span style={{ color: user.passwordSet ? 'green' : 'orange' }}>
                    {user.passwordSet ? 'Sim' : 'Pendente'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(user)} style={{ marginRight: '0.5rem', background: 'orange', color: 'white' }}>
                    Editar
                  </button>
                  <button onClick={() => handleToggle(user.id)} style={{ marginRight: '0.5rem', background: user.enabled ? 'red' : 'green', color: 'white' }}>
                    {user.enabled ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => handleDelete(user.id)} style={{ background: 'red', color: 'white' }}>
                    Excluir
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: '#666' }}>
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;