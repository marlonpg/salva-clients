import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import './Inventory.css';

const initialState = {
  name: '',
  category: '',
  description: '',
  price: '',
  stockQuantity: '',
  minStock: '',
  expirationDate: '',
  supplier: ''
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/products');
      setProducts(await res.json());
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
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
        ...form,
        price: form.price ? parseFloat(form.price) : 0,
        stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : 0,
        minStock: form.minStock ? parseInt(form.minStock) : 0
      };
      let res;
      if (editingId) {
        res = await apiRequest(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) throw new Error('Failed to save product');
      setForm(initialState);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = product => {
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price ?? '',
      stockQuantity: product.stockQuantity ?? '',
      minStock: product.minStock ?? '',
      expirationDate: product.expirationDate ?? '',
      supplier: product.supplier ?? ''
    });
    setEditingId(product.id);
  };

  const handleDelete = async id => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest(`/products/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minStock);

  return (
    <div className="inventory">
      <h2>Gerenciamento de Estoque</h2>
      
      {lowStockProducts.length > 0 && (
        <div className="alert">
          <strong>Alerta de Estoque Baixo:</strong> {lowStockProducts.length} produto(s) precisam de reposição
        </div>
      )}

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input name="name" placeholder="Nome do Produto" value={form.name} onChange={handleChange} required />
          <input name="category" placeholder="Categoria" value={form.category} onChange={handleChange} required />
          <input name="supplier" placeholder="Fornecedor" value={form.supplier} onChange={handleChange} />
        </div>
        <div className="form-row">
          <input name="description" placeholder="Descrição" value={form.description} onChange={handleChange} />
          <input name="price" type="number" step="0.01" min="0" placeholder="Preço" value={form.price} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input name="stockQuantity" type="number" min="0" placeholder="Quantidade em Estoque" value={form.stockQuantity} onChange={handleChange} required />
          <input name="minStock" type="number" min="0" placeholder="Estoque Mínimo" value={form.minStock} onChange={handleChange} required />
          <input name="expirationDate" type="date" placeholder="Data de Validade" value={form.expirationDate} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} style={{ background: editingId ? 'orange' : 'green', color: 'white' }}>
          {editingId ? 'Atualizar Produto' : 'Adicionar Produto'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setForm(initialState); setEditingId(null); }} style={{ marginLeft: '1rem' }}>
            Cancelar
          </button>
        )}
      </form>

      {error && <div className="error">{error}</div>}

      <div className="filters">
        <input 
          type="text" 
          placeholder="Buscar produtos..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">Todas as Categorias</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? <div>Carregando...</div> : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Estoque</th>
              <th>Estoque Mínimo</th>
              <th>Preço</th>
              <th>Fornecedor</th>
              <th>Validade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className={product.stockQuantity <= product.minStock ? 'low-stock' : ''}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.stockQuantity}</td>
                <td>{product.minStock}</td>
                <td>${product.price ? Number(product.price).toFixed(2) : '0.00'}</td>
                <td>{product.supplier}</td>
                <td>{product.expirationDate}</td>
                <td>
                  <button onClick={() => handleEdit(product)} style={{ marginRight: '0.5rem', background: 'orange', color: 'white' }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={{ background: 'red', color: 'white' }}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}