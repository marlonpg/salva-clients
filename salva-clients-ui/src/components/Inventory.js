import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import './Inventory.css';

const initialProductState = {
  name: '',
  category: '',
  description: '',
  price: '',
  minStock: ''
};

const initialMovementState = {
  productId: '',
  type: 'IN',
  quantity: '',
  unitPrice: '',
  supplier: '',
  notes: ''
};

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [productForm, setProductForm] = useState(initialProductState);
  const [movementForm, setMovementForm] = useState(initialMovementState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchMovements();
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

  const fetchMovements = async () => {
    try {
      const res = await apiRequest('/stock-movements');
      const data = await res.json();
      // Sort by date descending (newest first)
      setMovements(data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)));
    } catch (err) {
      setError('Failed to fetch movements');
    }
  };

  const handleProductChange = e => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleMovementChange = e => {
    setMovementForm({ ...movementForm, [e.target.name]: e.target.value });
  };

  const handleProductSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...productForm,
        price: productForm.price ? parseFloat(productForm.price) : 0,
        minStock: productForm.minStock ? parseInt(productForm.minStock) : 0,
        stockQuantity: 0
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
      setProductForm(initialProductState);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMovementSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Frontend validation for OUT movements
    if (movementForm.type === 'OUT' && movementForm.productId) {
      const selectedProduct = products.find(p => p.id === parseInt(movementForm.productId));
      const currentStock = selectedProduct?.stockQuantity || 0;
      const requestedQuantity = parseInt(movementForm.quantity);
      
      if (currentStock < requestedQuantity) {
        setError(`Estoque insuficiente. Estoque atual: ${currentStock}`);
        setLoading(false);
        return;
      }
    }
    
    try {
      const payload = {
        ...movementForm,
        quantity: parseInt(movementForm.quantity),
        unitPrice: movementForm.unitPrice ? parseFloat(movementForm.unitPrice) : 0
      };
      const res = await apiRequest('/stock-movements', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to save movement');
      }
      setMovementForm(initialMovementState);
      fetchProducts();
      fetchMovements();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = product => {
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price ?? '',
      minStock: product.minStock ?? ''
    });
    setEditingId(product.id);
    setActiveTab('products');
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

      <div className="tabs">
        <button 
          className={activeTab === 'products' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('products')}
        >
          Cadastrar Produtos
        </button>
        <button 
          className={activeTab === 'movements' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('movements')}
        >
          Movimentação de Estoque
        </button>
        <button 
          className={activeTab === 'inventory' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('inventory')}
        >
          Estoque Atual
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <form className="product-form" onSubmit={handleProductSubmit}>
            <div className="form-row">
              <input name="name" placeholder="Nome do Produto" value={productForm.name} onChange={handleProductChange} required />
              <input name="category" placeholder="Categoria" value={productForm.category} onChange={handleProductChange} required />
              <input name="description" placeholder="Descrição" value={productForm.description} onChange={handleProductChange} />
            </div>
            <div className="form-row">
              <input name="price" type="number" step="0.01" min="0" placeholder="Preço" value={productForm.price} onChange={handleProductChange} required />
              <input name="minStock" type="number" min="0" placeholder="Estoque Mínimo" value={productForm.minStock} onChange={handleProductChange} required />
            </div>
            <button type="submit" disabled={loading} style={{ background: editingId ? 'orange' : 'green', color: 'white' }}>
              {editingId ? 'Atualizar Produto' : 'Adicionar Produto'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setProductForm(initialProductState); setEditingId(null); }} style={{ marginLeft: '1rem' }}>
                Cancelar
              </button>
            )}
          </form>
          
          {loading ? <div>Carregando...</div> : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Preço</th>
                  <th>Estoque Mínimo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.description}</td>
                    <td>R$ {product.price ? Number(product.price).toFixed(2) : '0.00'}</td>
                    <td>{product.minStock}</td>
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
        </>
      )}

      {activeTab === 'movements' && (
        <>
          <form className="product-form" onSubmit={handleMovementSubmit}>
            <div className="form-row">
              <select name="productId" value={movementForm.productId} onChange={handleMovementChange} required>
                <option value="">Selecionar Produto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Estoque: {product.stockQuantity || 0})
                  </option>
                ))}
              </select>
              <select name="type" value={movementForm.type} onChange={handleMovementChange} required>
                <option value="IN">Entrada (Compra)</option>
                <option value="OUT">Saída (Venda/Uso)</option>
              </select>
            </div>
            <div className="form-row">
              <input name="quantity" type="number" min="1" placeholder="Quantidade" value={movementForm.quantity} onChange={handleMovementChange} required />
              <input name="unitPrice" type="number" step="0.01" min="0" placeholder="Preço Unitário" value={movementForm.unitPrice} onChange={handleMovementChange} required />
              <input name="supplier" placeholder="Fornecedor" value={movementForm.supplier} onChange={handleMovementChange} />
            </div>
            <div className="form-row">
              <input name="notes" placeholder="Observações" value={movementForm.notes} onChange={handleMovementChange} />
            </div>
            <button type="submit" disabled={loading} style={{ background: 'green', color: 'white' }}>
              Registrar Movimentação
            </button>
          </form>

          <h3 style={{ marginTop: '2rem', color: 'green' }}>Histórico de Movimentações</h3>
          {loading ? <div>Carregando...</div> : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Total</th>
                  <th>Fornecedor</th>
                  <th>Observações</th>
                  <th>Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(movement => (
                  <tr key={movement.id}>
                    <td>{movement.createdDate ? new Date(movement.createdDate).toLocaleString('pt-BR') : ''}</td>
                    <td>{movement.product ? movement.product.name : ''}</td>
                    <td>
                      <span style={{ 
                        color: movement.type === 'IN' ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {movement.type === 'IN' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td>{movement.quantity}</td>
                    <td>R$ {movement.unitPrice ? Number(movement.unitPrice).toFixed(2) : '0.00'}</td>
                    <td>R$ {movement.unitPrice && movement.quantity ? (Number(movement.unitPrice) * movement.quantity).toFixed(2) : '0.00'}</td>
                    <td>{movement.supplier || '-'}</td>
                    <td>{movement.notes || '-'}</td>
                    <td>{movement.createdBy || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {error && <div className="error">{error}</div>}

      {activeTab === 'inventory' && (
        <>
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
                  <th>Estoque Atual</th>
                  <th>Estoque Mínimo</th>
                  <th>Preço</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className={product.stockQuantity <= product.minStock ? 'low-stock' : ''}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.stockQuantity || 0}</td>
                    <td>{product.minStock}</td>
                    <td>R$ {product.price ? Number(product.price).toFixed(2) : '0.00'}</td>
                    <td>
                      {product.stockQuantity <= product.minStock ? (
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Repor Estoque</span>
                      ) : (
                        <span style={{ color: 'green' }}>OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}