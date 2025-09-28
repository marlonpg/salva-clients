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

const CostManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    supplier: '',
    notes: ''
  });

  const categories = [
    'Estoque/Produtos',
    'Combustível',
    'Manutenção Veicular',
    'Salários',
    'Honorários Veterinário',
    'Outros'
  ];

  useEffect(() => {
    loadExpenses();
  }, [selectedMonth]);

  const loadExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/expenses?month=${selectedMonth}`);
      setExpenses(response);
    } catch (err) {
      setError('Erro ao carregar despesas');
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
        await api.put(`/expenses/${editingId}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      setFormData({
        category: '',
        description: '',
        amount: '',
        expenseDate: new Date().toISOString().slice(0, 10),
        supplier: '',
        notes: ''
      });
      setEditingId(null);
      setShowForm(false);
      loadExpenses();
    } catch (err) {
      setError('Erro ao salvar despesa');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      supplier: expense.supplier || '',
      notes: expense.notes || ''
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/expenses/${id}`);
      loadExpenses();
    } catch (err) {
      setError('Erro ao excluir despesa');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalExpenses = () => {
    return expenses?.reduce((total, expense) => total + parseFloat(expense.amount), 0) || 0;
  };

  return (
    <div className="inventory">
      <h2>Gestão de Custos</h2>

      <div className="filters" style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Mês de Referência:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: 'green' }}>Despesas do Mês</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({
                category: '',
                description: '',
                amount: '',
                expenseDate: new Date().toISOString().slice(0, 10),
                supplier: '',
                notes: ''
              });
            }
          }}
          style={{ background: 'green', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : 'Nova Despesa'}
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Descrição *"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor *"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="date"
              value={formData.expenseDate}
              onChange={(e) => setFormData({...formData, expenseDate: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Fornecedor"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            />
            <input
              type="text"
              placeholder="Observações"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: editingId ? 'orange' : 'green', color: 'white' }}>
            {editingId ? 'Atualizar Despesa' : 'Salvar Despesa'}
          </button>
          {editingId && (
            <button type="button" onClick={() => {
              setFormData({
                category: '',
                description: '',
                amount: '',
                expenseDate: new Date().toISOString().slice(0, 10),
                supplier: '',
                notes: ''
              });
              setEditingId(null);
              setShowForm(false);
            }} style={{ marginLeft: '1rem' }}>
              Cancelar
            </button>
          )}
        </form>
      )}

      <div style={{ background: '#f0f8f0', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
        <h3 style={{ margin: 0, color: 'green' }}>Total do Mês: {formatCurrency(getTotalExpenses())}</h3>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? <div>Carregando...</div> : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Fornecedor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {expenses?.length > 0 ? expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{new Date(expense.expenseDate).toLocaleDateString('pt-BR')}</td>
                <td>{expense.category}</td>
                <td>{expense.description}</td>
                <td>{formatCurrency(expense.amount)}</td>
                <td>{expense.supplier || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(expense)} style={{ marginRight: '0.5rem', background: 'orange', color: 'white' }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(expense.id)} style={{ background: 'red', color: 'white' }}>
                    Excluir
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#666' }}>
                  Nenhuma despesa encontrada para este mês
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CostManagement;